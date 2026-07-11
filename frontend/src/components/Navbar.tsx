import { Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
            <Sparkles className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            Smart CSV Importer
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
