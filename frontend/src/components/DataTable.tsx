interface DataTableProps {
  columns: string[];
  rows: Record<string, string>[];
  maxHeightClass?: string;
}

export default function DataTable({ columns, rows, maxHeightClass = "max-h-[28rem]" }: DataTableProps) {
  return (
    <div className="relative">
      <div
        className={`w-full overflow-auto rounded-xl border border-slate-200/70 dark:border-white/10 ${maxHeightClass}`}
      >
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur dark:bg-slate-800/95">
            <tr>
              {columns.map((col) => (
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
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="odd:bg-transparent even:bg-slate-50/60 hover:bg-indigo-50/50 dark:even:bg-white/[.03] dark:hover:bg-indigo-500/[.06]"
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    title={row[col] ?? ""}
                    className="max-w-[220px] truncate border-b border-slate-100 px-4 py-2.5 text-slate-700 dark:border-white/5 dark:text-slate-300"
                  >
                    {row[col] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 rounded-l-xl bg-gradient-to-r from-white to-transparent dark:from-slate-900" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 rounded-r-xl bg-gradient-to-l from-white to-transparent dark:from-slate-900" />
    </div>
  );
}
