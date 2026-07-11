"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCopy, Copy, Download, PartyPopper, AlertTriangle } from "lucide-react";
import { CRM_COLUMNS, type ExtractResponse } from "@/types/crm";
import DataTable from "./DataTable";
import Card from "./Card";
import StatCard from "./StatCard";
import { StatusBadge, DataSourceBadge, ReasonTag, DuplicateTag } from "./Badge";

function toCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCsv(rows: Record<string, string>[], columns: string[], filename: string) {
  const lines = [
    columns.map(toCsvValue).join(","),
    ...rows.map((row) => columns.map((col) => toCsvValue(row[col] ?? "")).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function EmptyState({ icon: Icon, message }: { icon: typeof PartyPopper; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Icon className="h-8 w-8 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

export default function ResultsView({ result }: { result: ExtractResponse }) {
  const [copied, setCopied] = useState(false);
  const duplicateCount = result.duplicateCount ?? 0;
  const skippedRows = result.skipped.map((s) => ({ ...s.row, "Skip Reason": s.reason }));
  const skippedColumns =
    skippedRows.length > 0
      ? Array.from(
          new Set(skippedRows.flatMap((r) => Object.keys(r).filter((k) => k !== "Skip Reason"))),
        )
      : [];
  const importedRows = result.imported.map((record) => ({
    ...record,
    Duplicate: record.is_duplicate ? "yes" : "",
  }));

  async function handleCopyJson() {
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExportCsv() {
    downloadCsv(
      result.imported as unknown as Record<string, string>[],
      CRM_COLUMNS as string[],
      "crm_imported_records.csv",
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${duplicateCount > 0 ? "lg:grid-cols-3" : ""}`}
      >
        <StatCard icon={CheckCircle2} label="Imported" value={result.totalImported} variant="success" />
        <StatCard icon={AlertTriangle} label="Skipped" value={result.totalSkipped} variant="warning" />
        {duplicateCount > 0 && (
          <StatCard icon={Copy} label="Duplicates Found" value={duplicateCount} variant="info" />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Imported CRM Records
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={result.imported.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <ClipboardCopy className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Copy JSON"}
          </button>
        </div>
      </div>

      <Card>
        {importedRows.length > 0 ? (
          <DataTable
            columns={["Duplicate", ...CRM_COLUMNS] as string[]}
            rows={importedRows as unknown as Record<string, string>[]}
            renderCell={(col, value, row) => {
              if (col === "Duplicate") {
                return value === "yes" ? (
                  <DuplicateTag duplicateOf={(row as unknown as { duplicate_of: number | null }).duplicate_of} />
                ) : (
                  <span className="text-slate-300 dark:text-slate-600">—</span>
                );
              }
              if (col === "crm_status") return <StatusBadge value={value} />;
              if (col === "data_source") return <DataSourceBadge value={value} />;
              return value;
            }}
          />
        ) : (
          <EmptyState icon={AlertTriangle} message="No records were imported." />
        )}
      </Card>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Skipped Records
        </h3>
        <Card>
          {skippedRows.length > 0 ? (
            <DataTable
              columns={[...skippedColumns, "Skip Reason"]}
              rows={skippedRows}
              renderCell={(col, value) => (col === "Skip Reason" ? <ReasonTag value={value} /> : value)}
            />
          ) : (
            <EmptyState icon={PartyPopper} message="No records skipped 🎉" />
          )}
        </Card>
      </div>
    </div>
  );
}
