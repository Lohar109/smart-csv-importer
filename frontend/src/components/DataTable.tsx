interface DataTableProps {
  columns: string[];
  rows: Record<string, string>[];
  maxHeightClass?: string;
}

export default function DataTable({ columns, rows, maxHeightClass = "max-h-[28rem]" }: DataTableProps) {
  return (
    <div className={`w-full overflow-auto rounded-lg border border-black/10 dark:border-white/15 ${maxHeightClass}`}>
      <table className="min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="whitespace-nowrap border-b border-black/10 px-3 py-2 text-left font-semibold dark:border-white/15"
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
              className="odd:bg-transparent even:bg-black/[.02] dark:even:bg-white/[.03]"
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="whitespace-nowrap border-b border-black/5 px-3 py-2 dark:border-white/10"
                >
                  {row[col] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
