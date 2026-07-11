import type { CsvRow, ExtractResponse } from "@/types/crm";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface BatchProgress {
  batchIndex: number;
  totalBatches: number;
  recordsProcessedSoFar: number;
}

interface StreamExtractParams {
  rows: CsvRow[];
  onProgress: (progress: BatchProgress) => void;
}

/**
 * Calls POST /api/extract/stream and parses the Server-Sent Events frames
 * from the response body as they arrive, reporting batch progress live.
 * Uses fetch + ReadableStream (not EventSource, which cannot send a POST
 * body) so it needs no extra dependency. Throws if streaming isn't
 * supported or the request/stream fails — callers should catch and fall
 * back to the plain POST /api/extract endpoint.
 */
export async function streamExtraction({
  rows,
  onProgress,
}: StreamExtractParams): Promise<ExtractResponse> {
  if (typeof fetch === "undefined" || typeof ReadableStream === "undefined") {
    throw new Error("Streaming is not supported in this environment");
  }

  const response = await fetch(`${API_BASE_URL}/api/extract/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Streaming request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: ExtractResponse | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith("data:")) continue;

      let event: { type: string; [key: string]: unknown };
      try {
        event = JSON.parse(line.slice(5).trim());
      } catch {
        continue;
      }

      if (event.type === "batch_complete") {
        onProgress({
          batchIndex: event.batchIndex as number,
          totalBatches: event.totalBatches as number,
          recordsProcessedSoFar: event.recordsProcessedSoFar as number,
        });
      } else if (event.type === "done") {
        const result: Record<string, unknown> = { ...event };
        delete result.type;
        finalResult = result as unknown as ExtractResponse;
      } else if (event.type === "error") {
        throw new Error((event.message as string) || "Extraction failed");
      }
    }
  }

  if (!finalResult) {
    throw new Error("Stream ended without a final result");
  }

  return finalResult;
}
