import type { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/50 dark:border-white/10 dark:bg-slate-900 dark:shadow-none ${className}`}
    >
      {children}
    </div>
  );
}
