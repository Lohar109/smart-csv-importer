import { Sparkles } from "lucide-react";
import type { BatchProgress } from "@/lib/sseExtract";

interface LiveProgressScreenProps {
  progress: BatchProgress | null;
  totalRows: number;
}

export default function LiveProgressScreen({ progress, totalRows }: LiveProgressScreenProps) {
  const percent = progress
    ? Math.min(100, Math.round((progress.batchIndex / progress.totalBatches) * 100))
    : 0;

  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-slate-200/70 bg-white px-8 py-16 text-center shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex h-16 w-16 animate-pulse-scale items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
        <Sparkles className="h-8 w-8" strokeWidth={1.75} />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {progress
            ? `Processing batch ${progress.batchIndex} of ${progress.totalBatches}…`
            : "Starting AI extraction…"}
        </p>
        {progress && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {progress.recordsProcessedSoFar} of {totalRows} rows processed
          </p>
        )}
      </div>

      <div className="h-1.5 w-56 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
