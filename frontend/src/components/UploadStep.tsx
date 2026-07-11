"use client";

import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import type { CsvRow } from "@/types/crm";

interface UploadStepProps {
  onParsed: (params: { fileName: string; headers: string[]; rows: CsvRow[] }) => void;
  onError: (message: string) => void;
}

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
      className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : "border-black/15 hover:border-black/30 dark:border-white/20 dark:hover:border-white/35"
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
      {isParsing ? (
        <p className="text-sm text-black/60 dark:text-white/60">Parsing CSV…</p>
      ) : (
        <>
          <p className="text-lg font-medium">Drag & drop your CSV file here</p>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            or click to browse — any column layout works
          </p>
        </>
      )}
    </div>
  );
}
