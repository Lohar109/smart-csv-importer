const CRM_STATUS_STYLES: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  BAD_LEAD: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  DID_NOT_CONNECT: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
  SALE_DONE: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
};

const DATA_SOURCE_CLASS =
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300";

const NEUTRAL_TAG_CLASS =
  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";

const DUPLICATE_TAG_CLASS =
  "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300";

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function Pill({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  if (!value) return <span className="text-slate-300 dark:text-slate-600">—</span>;
  const className = CRM_STATUS_STYLES[value] ?? NEUTRAL_TAG_CLASS;
  return <Pill className={className}>{formatLabel(value)}</Pill>;
}

export function DataSourceBadge({ value }: { value: string }) {
  if (!value) return <span className="text-slate-300 dark:text-slate-600">—</span>;
  return <Pill className={DATA_SOURCE_CLASS}>{formatLabel(value)}</Pill>;
}

export function ReasonTag({ value }: { value: string }) {
  return <Pill className={NEUTRAL_TAG_CLASS}>{value}</Pill>;
}

export function DuplicateTag({ duplicateOf }: { duplicateOf: number | null | undefined }) {
  return (
    <Pill className={DUPLICATE_TAG_CLASS}>
      {typeof duplicateOf === "number" ? `Duplicate of #${duplicateOf + 1}` : "Duplicate"}
    </Pill>
  );
}
