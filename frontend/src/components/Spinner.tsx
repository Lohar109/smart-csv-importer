export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-black/70 dark:text-white/70">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-blue-600 dark:border-white/20 dark:border-t-blue-400"
        aria-hidden="true"
      />
      {label && <span>{label}</span>}
    </div>
  );
}
