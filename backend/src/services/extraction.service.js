const { getLlmProvider } = require('./llm/llmProviderFactory');
const { buildExtractionPrompt } = require('./promptBuilder');
const { parseExtractionResponse } = require('./responseParser');
const { markDuplicates } = require('./dedupe.service');

const BATCH_SIZE = 20;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function chunkRows(rows, size) {
  const batches = [];
  for (let i = 0; i < rows.length; i += size) {
    batches.push(rows.slice(i, i + size));
  }
  return batches;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractBatchWithRetry(batch, provider) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const prompt = buildExtractionPrompt(batch);
      const rawText = await provider.generate(prompt);
      return parseExtractionResponse(rawText);
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  // All retries exhausted: skip every row in this batch rather than failing the whole import.
  return {
    imported: [],
    skipped: batch.map((row) => ({
      row,
      reason: `AI extraction failed after ${MAX_RETRIES + 1} attempts: ${lastError.message}`,
    })),
  };
}

/**
 * Splits rows into batches, runs each through the LLM extraction prompt
 * (with retry on failure), and combines the results.
 *
 * If `onBatchComplete` is provided, it is called once per batch as soon as
 * that batch settles (in completion order, not necessarily input order)
 * with { batchIndex, totalBatches, recordsProcessedSoFar } — used to drive
 * live progress updates over SSE without changing the non-streaming caller.
 */
async function extractCrmRecords(rows, { onBatchComplete } = {}) {
  const provider = getLlmProvider();
  const batches = chunkRows(rows, BATCH_SIZE);
  const totalBatches = batches.length;

  let completedBatches = 0;
  let recordsProcessedSoFar = 0;

  const results = await Promise.all(
    batches.map(async (batch) => {
      const result = await extractBatchWithRetry(batch, provider);
      completedBatches += 1;
      recordsProcessedSoFar += result.imported.length + result.skipped.length;
      if (onBatchComplete) {
        onBatchComplete({
          batchIndex: completedBatches,
          totalBatches,
          recordsProcessedSoFar,
        });
      }
      return result;
    }),
  );

  const imported = [];
  const skipped = [];
  for (const result of results) {
    imported.push(...result.imported);
    skipped.push(...result.skipped);
  }

  const dedupedImported = markDuplicates(imported);
  const duplicateCount = dedupedImported.filter((record) => record.is_duplicate).length;

  return {
    imported: dedupedImported,
    skipped,
    totalImported: dedupedImported.length,
    totalSkipped: skipped.length,
    duplicateCount,
  };
}

module.exports = { extractCrmRecords, BATCH_SIZE };
