export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
      <div className="h-4 w-2/3 rounded bg-[var(--stroke)]" />
      <div className="mt-3 h-3 w-1/2 rounded bg-[var(--stroke)]" />
      <div className="mt-4 h-8 w-24 rounded-xl bg-[var(--stroke)]" />
    </div>
  );
}
