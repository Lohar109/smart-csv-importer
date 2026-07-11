"use client";

import { useState } from "react";
import { ArrowRight, FileText, RotateCcw } from "lucide-react";
import UploadStep from "@/components/UploadStep";
import DataTable from "@/components/DataTable";
import ResultsView from "@/components/ResultsView";
import ProcessingScreen from "@/components/ProcessingScreen";
import Stepper from "@/components/Stepper";
import Alert from "@/components/Alert";
import Card from "@/components/Card";
import { apiClient, extractErrorMessage } from "@/lib/api";
import type { CsvRow, ExtractResponse } from "@/types/crm";

type WizardStep = "upload" | "preview" | "results";

const STEPS: { key: WizardStep; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "preview", label: "Preview" },
  { key: "results", label: "Results" },
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
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Smart CSV Importer
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          AI-powered CRM lead extraction from any CSV format
        </p>
      </div>

      <Stepper steps={STEPS} currentKey={step} />

      {error && <Alert message={error} onDismiss={() => setError("")} />}

      {step === "upload" && (
        <div key="upload" className="animate-step-in">
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
        </div>
      )}

      {step === "preview" && isImporting && (
        <div key="processing" className="animate-step-in">
          <ProcessingScreen />
        </div>
      )}

      {step === "preview" && !isImporting && (
        <div key="preview" className="flex animate-step-in flex-col gap-5">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FileText className="h-4.5 w-4.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
                <span className="font-medium text-slate-900 dark:text-white">{fileName}</span>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                  {rows.length} rows
                </span>
              </div>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Choose a different file
              </button>
            </div>

            <div className="mt-4">
              <DataTable columns={headers} rows={rows} />
            </div>
          </Card>

          <button
            type="button"
            onClick={handleConfirmImport}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.99]"
          >
            Confirm Import
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      )}

      {step === "results" && result && (
        <div key="results" className="flex animate-step-in flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Import complete for{" "}
              <span className="font-medium text-slate-900 dark:text-white">{fileName}</span>
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Import another file
            </button>
          </div>
          <ResultsView result={result} />
        </div>
      )}
    </div>
  );
}
