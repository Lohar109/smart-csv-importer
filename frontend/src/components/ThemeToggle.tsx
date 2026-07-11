"use client";

import { useSyncExternalStore } from "react";

const THEME_KEY = "smart-csv-importer-theme";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

function setTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setTheme(!isDark)}
      aria-label="Toggle dark mode"
      suppressHydrationWarning
      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-lg transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
