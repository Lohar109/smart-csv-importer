import type { LucideIcon } from "lucide-react";

type StatVariant = "success" | "warning" | "info";

const VARIANT_STYLES: Record<StatVariant, { border: string; bg: string; icon: string; text: string }> = {
  success: {
    border: "border-l-green-500",
    bg: "bg-green-50/70 dark:bg-green-500/10",
    icon: "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400",
    text: "text-green-700 dark:text-green-400",
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-50/70 dark:bg-amber-500/10",
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    text: "text-amber-700 dark:text-amber-400",
  },
  info: {
    border: "border-l-purple-500",
    bg: "bg-purple-50/70 dark:bg-purple-500/10",
    icon: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
    text: "text-purple-700 dark:text-purple-300",
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  variant: StatVariant;
}) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border border-slate-200/70 border-l-4 ${styles.border} ${styles.bg} p-5 shadow-sm dark:border-white/10`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <div>
        <p className={`text-3xl font-bold leading-tight ${styles.text}`}>{value}</p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}
