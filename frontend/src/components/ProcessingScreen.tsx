"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const STATUS_MESSAGES = [
  "Parsing rows…",
  "Mapping fields with AI…",
  "Applying CRM schema rules…",
  "Finalizing records…",
];

const MESSAGE_INTERVAL_MS = 1800;

export default function ProcessingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-slate-200/70 bg-white px-8 py-16 text-center shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex h-16 w-16 animate-pulse-scale items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
        <Sparkles className="h-8 w-8" strokeWidth={1.75} />
      </div>

      <p
        key={messageIndex}
        className="animate-step-in text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {STATUS_MESSAGES[messageIndex]}
      </p>

      <div className="h-1.5 w-56 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full w-1/2 animate-indeterminate-bar rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
      </div>
    </div>
  );
}
