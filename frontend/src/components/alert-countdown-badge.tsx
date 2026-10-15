import { describeEstimate, formatEstimatedDate } from '@/lib/alert-countdown';

type AlertCountdownBadgeProps = {
  daysRemaining: number | null;
  /** Fecha estimada (ISO). Se muestra siempre como estimación, nunca como dato oficial. */
  estimatedDate?: string | null;
  size?: 'sm' | 'lg';
  className?: string;
};

export function AlertCountdownBadge({
  daysRemaining,
  estimatedDate,
  size = 'sm',
  className,
}: AlertCountdownBadgeProps) {
  const dateLabel = formatEstimatedDate(estimatedDate);
  const isPast = daysRemaining !== null && daysRemaining < 0;
  const shell = isPast
    ? 'border-[var(--stroke)] bg-[var(--bg-app)]'
    : 'border-[rgba(78,143,58,0.28)] bg-[linear-gradient(135deg,rgba(78,143,58,0.12),rgba(255,255,255,0.98))]';

  return (
    <div
      className={['rounded-2xl border shadow-card', shell, size === 'lg' ? 'p-4 md:p-5' : 'p-3.5', className || ''].join(' ')}
    >
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
        Fecha estimada · no confirmada
      </p>
      <p
        className={[
          'mt-2 font-black leading-tight tracking-tight text-[var(--ink)]',
          size === 'lg' ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl',
        ].join(' ')}
      >
        {dateLabel ?? 'Sin fecha'}
      </p>
      <p className={['mt-2 font-medium text-[var(--ink-soft)]', size === 'lg' ? 'text-sm' : 'text-xs'].join(' ')}>
        {describeEstimate(daysRemaining)}
      </p>
    </div>
  );
}
