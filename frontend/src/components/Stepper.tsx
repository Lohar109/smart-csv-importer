import { Check } from "lucide-react";

export interface StepDef {
  key: string;
  label: string;
}

interface StepperProps {
  steps: StepDef[];
  currentKey: string;
}

export default function Stepper({ steps, currentKey }: StepperProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentKey);

  return (
    <ol className="flex w-full items-start">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;
        const isLast = idx === steps.length - 1;

        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors duration-300 sm:h-9 sm:w-9 ${
                  isCompleted
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : isActive
                      ? "border-indigo-600 bg-white text-indigo-600 shadow-sm shadow-indigo-500/20 dark:bg-slate-900"
                      : "border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" strokeWidth={2.5} /> : idx + 1}
              </div>
              <span
                className={`text-[11px] font-medium sm:text-xs ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : isCompleted
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mx-2 mb-5 h-0.5 flex-1 rounded-full transition-colors duration-300 sm:mx-4 ${
                  isCompleted ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
