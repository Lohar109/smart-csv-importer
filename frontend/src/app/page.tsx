"use client";

import { useState } from "react";
import UploadStep from "@/components/UploadStep";
import DataTable from "@/components/DataTable";
import ResultsView from "@/components/ResultsView";
import Spinner from "@/components/Spinner";
import { apiClient, extractErrorMessage } from "@/lib/api";
import type { CsvRow, ExtractResponse } from "@/types/crm";

type WizardStep = "upload" | "preview" | "results";

const STEP_LABELS: { key: WizardStep; label: string }[] = [
  { key: "upload", label: "1. Upload" },
  { key: "preview", label: "2. Preview" },
  { key: "results", label: "3. Results" },
];

export default function Home() {
  const [step, setStep] = useState<WizardStep>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [result, setResult] = useState<ExtractResponse | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setStep("upload");
    setFileName("");
    setHeaders([]);
    setRows([]);
    setResult(null);
    setError("");
  }

  async function handleConfirmImport() {
    setError("");
    setIsImporting(true);
    try {
      const { data } = await apiClient.post<ExtractResponse>("/api/extract", { rows });
      setResult(data);
      setStep("results");
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to extract CRM records. Please try again."));
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold">Smart CSV Importer</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          AI-powered CRM lead extraction from any CSV format
        </p>
      </header>

      <nav className="flex gap-4 text-sm">
        {STEP_LABELS.map((s) => (
          <span
            key={s.key}
            className={`rounded-full px-3 py-1 ${
              s.key === step
                ? "bg-blue-600 text-white"
                : "bg-black/5 text-black/50 dark:bg-white/10 dark:text-white/50"
            }`}
          >
            {s.label}
          </span>
        ))}
      </nav>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {step === "upload" && (
        <UploadStep
          onParsed={({ fileName, headers, rows }) => {
            setFileName(fileName);
            setHeaders(headers);
            setRows(rows);
            setError("");
            setStep("preview");
          }}
          onError={setError}
        />
      )}

      {step === "preview" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-black/60 dark:text-white/60">
              <span className="font-medium text-black dark:text-white">{fileName}</span> —{" "}
              {rows.length} rows detected
            </p>
            <button
              type="button"
              onClick={reset}
              className="text-sm text-black/50 underline hover:text-black dark:text-white/50 dark:hover:text-white"
            >
              Choose a different file
            </button>
          </div>

          <DataTable columns={headers} rows={rows} />

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isImporting}
              className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isImporting ? "Importing…" : "Confirm Import"}
            </button>
            {isImporting && <Spinner label="Running AI extraction on your rows…" />}
          </div>
        </div>
      )}

      {step === "results" && result && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-black/60 dark:text-white/60">
              Import complete for <span className="font-medium text-black dark:text-white">{fileName}</span>
            </p>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-black/15 px-4 py-1.5 text-sm hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
            >
              Import another file
            </button>
          </div>
          <ResultsView result={result} />
        </div>
      )}
    </div>
  );
}
