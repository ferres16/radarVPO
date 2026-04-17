export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white p-6 text-center shadow-card">
      <h3 className="text-base font-semibold text-[var(--ink)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">{description}</p>
    </div>
  );
}
