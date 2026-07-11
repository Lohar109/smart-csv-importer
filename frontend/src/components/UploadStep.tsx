"use client";

import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { LayoutGrid, Loader2, Sparkles, UploadCloud, Zap } from "lucide-react";
import type { CsvRow } from "@/types/crm";

interface UploadStepProps {
  onParsed: (params: { fileName: string; headers: string[]; rows: CsvRow[] }) => void;
  onError: (message: string) => void;
}

const FEATURE_HINTS = [
  { icon: LayoutGrid, text: "Any CSV layout" },
  { icon: Sparkles, text: "AI-powered mapping" },
  { icon: Zap, text: "Instant preview" },
];

export default function UploadStep({ onParsed, onError }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        onError("Please upload a .csv file.");
        return;
      }

      setIsParsing(true);
      Papa.parse<CsvRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setIsParsing(false);
          if (result.errors.length > 0) {
            onError(result.errors[0].message || "Failed to parse CSV file.");
            return;
          }
          const headers = result.meta.fields ?? [];
          if (headers.length === 0 || result.data.length === 0) {
            onError("The CSV file appears to be empty.");
            return;
          }
          onParsed({ fileName: file.name, headers, rows: result.data });
        },
        error: (err) => {
          setIsParsing(false);
          onError(err.message || "Failed to parse CSV file.");
        },
      });
    },
    [onParsed, onError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) parseFile(file);
    },
    [parseFile],
  );

  return (
    <div className="flex flex-col gap-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center shadow-sm transition-all duration-200 ${
          isDragging
            ? "scale-[1.01] border-indigo-500 bg-indigo-50 shadow-indigo-500/10 dark:border-indigo-400 dark:bg-indigo-500/10"
            : "border-slate-300 bg-white/60 hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-500/5"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) parseFile(file);
            e.target.value = "";
          }}
        />

        <div
          className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-200 ${
            isDragging
              ? "bg-indigo-600 text-white"
              : "bg-indigo-100 text-indigo-600 group-hover:scale-105 dark:bg-indigo-500/15 dark:text-indigo-400"
          }`}
        >
          {isParsing ? (
            <Loader2 className="h-8 w-8 animate-spin" strokeWidth={1.75} />
          ) : (
            <UploadCloud className="h-8 w-8" strokeWidth={1.75} />
          )}
        </div>

        {isParsing ? (
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Parsing your CSV…
          </p>
        ) : (
          <>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              Drag & drop your CSV file here
            </p>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              or click to browse — any column layout works
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {FEATURE_HINTS.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-white/60 px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300"
          >
            <Icon className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" strokeWidth={2} />
            <span className="font-medium">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
