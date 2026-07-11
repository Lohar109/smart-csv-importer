"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import type { ConfidenceLevel } from "@/types/crm";

interface EditableCellProps {
  value: string;
  confidence: ConfidenceLevel;
  onCommit: (newValue: string) => void;
  options?: string[];
}

const CONFIDENCE_STYLES: Record<ConfidenceLevel, string> = {
  high: "",
  medium: "bg-yellow-50 dark:bg-yellow-500/10",
  low: "border border-amber-300 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-500/10",
};

export default function EditableCell({ value, confidence, onCommit, options }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing) (inputRef.current ?? selectRef.current)?.focus();
  }, [isEditing]);

  function startEditing() {
    setDraft(value);
    setIsEditing(true);
  }

  function commit(nextValue: string) {
    setIsEditing(false);
    if (nextValue !== value) onCommit(nextValue);
  }

  if (isEditing && options) {
    return (
      <select
        ref={selectRef}
        value={draft}
        onChange={(e) => commit(e.target.value)}
        onBlur={() => setIsEditing(false)}
        className="w-full min-w-[140px] rounded-md border border-indigo-400 bg-white px-1.5 py-1 text-sm outline-none ring-2 ring-indigo-100 dark:bg-slate-800 dark:ring-indigo-500/20"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt || "(blank)"}
          </option>
        ))}
      </select>
    );
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(draft);
          if (e.key === "Escape") {
            setDraft(value);
            setIsEditing(false);
          }
        }}
        className="w-full min-w-[120px] rounded-md border border-indigo-400 bg-white px-1.5 py-1 text-sm outline-none ring-2 ring-indigo-100 dark:bg-slate-800 dark:ring-indigo-500/20"
      />
    );
  }

  return (
    <div
      className={`group -mx-1.5 -my-1 flex items-center gap-1.5 rounded-md px-1.5 py-1 ${CONFIDENCE_STYLES[confidence]} ${
        confidence !== "high" ? "cursor-pointer" : ""
      }`}
      onClick={() => {
        if (confidence !== "high") startEditing();
      }}
    >
      <span className="truncate">
        {value || <span className="text-slate-300 dark:text-slate-600">—</span>}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          startEditing();
        }}
        aria-label="Edit field"
        className={`ml-auto shrink-0 rounded p-0.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 ${
          confidence !== "high" ? "opacity-70" : ""
        }`}
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  );
}
