"use client";

import { useMemo } from "react";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import {
  CRM_COLUMNS,
  CRM_STATUS_OPTIONS,
  DATA_SOURCE_OPTIONS,
  type CrmFieldKey,
  type CrmRecord,
} from "@/types/crm";
import Card from "./Card";
import EditableCell from "./EditableCell";

interface ReviewStepProps {
  records: CrmRecord[];
  onFieldChange: (recordIndex: number, field: CrmFieldKey, value: string) => void;
  onConfirm: () => void;
}

function countFieldsNeedingReview(records: CrmRecord[]): number {
  let count = 0;
  for (const record of records) {
    for (const field of CRM_COLUMNS) {
      const confidence = record.field_confidence?.[field] ?? "high";
      if (confidence !== "high") count += 1;
    }
  }
  return count;
}

export default function ReviewStep({ records, onFieldChange, onConfirm }: ReviewStepProps) {
  const reviewCount = useMemo(() => countFieldsNeedingReview(records), [records]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
          <ClipboardCheck className="h-4 w-4" />
          {reviewCount > 0
            ? `${reviewCount} field${reviewCount === 1 ? "" : "s"} need review`
            : "All fields look confident"}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Amber cells were low-confidence AI guesses — click to edit. Yellow-tinted cells are
          medium confidence.
        </p>
      </div>

      <Card>
        <div className="w-full overflow-auto rounded-xl border border-slate-200/70 dark:border-white/10">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur dark:bg-slate-800/95">
              <tr>
                {CRM_COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record, idx) => (
                <tr
                  key={idx}
                  className="odd:bg-transparent even:bg-slate-50/60 dark:even:bg-white/[.03]"
                >
                  {CRM_COLUMNS.map((col) => (
                    <td
                      key={col}
                      className="max-w-[220px] border-b border-slate-100 px-4 py-2.5 text-slate-700 dark:border-white/5 dark:text-slate-300"
                    >
                      <EditableCell
                        value={record[col] != null ? String(record[col]) : ""}
                        confidence={record.field_confidence?.[col] ?? "high"}
                        onCommit={(value) => onFieldChange(idx, col, value)}
                        options={
                          col === "crm_status"
                            ? CRM_STATUS_OPTIONS
                            : col === "data_source"
                              ? DATA_SOURCE_OPTIONS
                              : undefined
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <button
        type="button"
        onClick={onConfirm}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.99]"
      >
        Confirm & Import
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
