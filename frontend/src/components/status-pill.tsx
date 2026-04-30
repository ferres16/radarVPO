type StatusTone = 'active' | 'locked' | 'warning' | 'neutral';

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
};

const toneStyles: Record<StatusTone, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  locked: 'border-slate-200 bg-slate-100 text-slate-500',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  neutral: 'border-[var(--stroke)] bg-white text-[var(--ink-soft)]',
};

export function StatusPill({ label, tone = 'neutral' }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${toneStyles[tone]}`}
    >
      {label}
    </span>
  );
}
