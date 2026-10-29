import { describeEstimate, formatEstimatedDate } from '@/lib/alert-countdown';

type AlertCountdownBadgeProps = {
  daysRemaining: number | null;
  /** Fecha estimada (ISO). Se muestra como dato secundario, no como etiqueta de “no confirmada”. */
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

  const daysHero =
    daysRemaining === null
      ? null
      : daysRemaining > 0
        ? String(daysRemaining)
        : daysRemaining === 0
          ? '0'
          : null;

  return (
    <div
      className={['rounded-2xl border shadow-card', shell, size === 'lg' ? 'p-4 md:p-5' : 'p-3.5', className || ''].join(' ')}
    >
      {daysHero !== null ? (
        <>
          <p
            className={[
              'font-black leading-none tracking-tight text-[var(--ink)]',
              size === 'lg' ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl',
            ].join(' ')}
          >
            {daysHero}
          </p>
          <p className={['mt-2 font-bold text-[var(--ink)]', size === 'lg' ? 'text-base' : 'text-sm'].join(' ')}>
            {daysRemaining === 1 ? 'día estimado restante' : 'días estimados restantes'}
          </p>
        </>
      ) : (
        <p
          className={[
            'font-black leading-tight tracking-tight text-[var(--ink)]',
            size === 'lg' ? 'text-xl md:text-2xl' : 'text-lg md:text-xl',
          ].join(' ')}
        >
          {describeEstimate(daysRemaining)}
        </p>
      )}
      {dateLabel ? (
        <p className={['mt-2 text-[var(--ink-soft)]', size === 'lg' ? 'text-sm' : 'text-xs'].join(' ')}>
          Estimación: {dateLabel}
        </p>
      ) : null}
    </div>
  );
}
