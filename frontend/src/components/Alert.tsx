"use client";

import { AlertCircle, X } from "lucide-react";

interface AlertProps {
  message: string;
  onDismiss?: () => void;
}

export default function Alert({ message, onDismiss }: AlertProps) {
  return (
    <div className="flex animate-step-in items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm dark:border-red-500/20 dark:bg-red-950/40 dark:text-red-400">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-0.5 text-red-500 transition-colors hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
