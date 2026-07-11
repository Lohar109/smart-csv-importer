import { CRM_COLUMNS, type ExtractResponse } from "@/types/crm";
import DataTable from "./DataTable";

export default function ResultsView({ result }: { result: ExtractResponse }) {
  const skippedRows = result.skipped.map((s) => ({ ...s.row, "Skip Reason": s.reason }));
  const skippedColumns =
    skippedRows.length > 0
      ? Array.from(
          new Set(skippedRows.flatMap((r) => Object.keys(r).filter((k) => k !== "Skip Reason"))),
        )
      : [];

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-green-600/20 bg-green-50 p-4 dark:border-green-400/20 dark:bg-green-950/30">
          <p className="text-sm text-green-700 dark:text-green-400">Imported</p>
          <p className="text-3xl font-semibold text-green-700 dark:text-green-400">
            {result.totalImported}
          </p>
        </div>
        <div className="rounded-lg border border-amber-600/20 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-950/30">
          <p className="text-sm text-amber-700 dark:text-amber-400">Skipped</p>
          <p className="text-3xl font-semibold text-amber-700 dark:text-amber-400">
            {result.totalSkipped}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-semibold">Imported CRM Records</h3>
        {result.imported.length > 0 ? (
          <DataTable
            columns={CRM_COLUMNS as string[]}
            rows={result.imported as unknown as Record<string, string>[]}
          />
        ) : (
          <p className="text-sm text-black/60 dark:text-white/60">No records were imported.</p>
        )}
      </div>

      {skippedRows.length > 0 && (
        <div>
          <h3 className="mb-2 text-lg font-semibold">Skipped Records</h3>
          <DataTable columns={[...skippedColumns, "Skip Reason"]} rows={skippedRows} />
        </div>
      )}
    </div>
  );
}
