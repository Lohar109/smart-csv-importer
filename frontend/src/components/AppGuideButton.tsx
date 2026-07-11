"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Info,
  Lightbulb,
  ListChecks,
  UploadCloud,
  X,
} from "lucide-react";

const STEPS = [
  { icon: UploadCloud, text: "Upload any CSV — column names and layout don't matter." },
  { icon: Eye, text: "Preview your data before anything is sent anywhere." },
  {
    icon: ClipboardCheck,
    text: "Review AI-mapped fields — edit anything flagged low-confidence.",
  },
  { icon: CheckCircle2, text: "Confirm to import — extraction runs with live progress." },
  { icon: ListChecks, text: "See results, with duplicates and skipped records flagged." },
];

const TIPS = [
  "Multiple emails or phone numbers in a row are automatically consolidated.",
  "Records without an email or phone are automatically skipped.",
  "Duplicate leads within your file are flagged, not removed.",
];

export default function AppGuideButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="App guide"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-slate-600 transition-all hover:scale-105 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:border-white/15 dark:text-slate-300 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
      >
        <Info className="h-4 w-4" />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex animate-step-in items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="app-guide-title"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <h2
                  id="app-guide-title"
                  className="text-lg font-semibold text-slate-900 dark:text-white"
                >
                  What can you do here?
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Smart CSV Importer turns any messy CSV into clean CRM leads using AI — here&apos;s
                how it works.
              </p>

              <ol className="mt-5 flex flex-col gap-3">
                {STEPS.map(({ icon: Icon, text }, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    <span className="pt-1 text-sm text-slate-700 dark:text-slate-300">{text}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-5 rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
                <div className="flex items-center gap-1.5 text-sm font-medium text-amber-800 dark:text-amber-400">
                  <Lightbulb className="h-4 w-4" />
                  Tips
                </div>
                <ul className="mt-2 flex flex-col gap-1.5 text-xs text-amber-700 dark:text-amber-400/90">
                  {TIPS.map((tip, idx) => (
                    <li key={idx} className="flex gap-1.5">
                      <span>•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
