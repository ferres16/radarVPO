type AlertCountdownBadgeProps = {
  daysRemaining: number | null;
  size?: 'sm' | 'lg';
  className?: string;
};

function badgeTone(daysRemaining: number | null) {
  if (daysRemaining === null) {
    return 'neutral';
  }

  if (daysRemaining > 0) {
    return 'positive';
  }

  if (daysRemaining === 0) {
    return 'today';
  }

  return 'negative';
}

function toneClasses(tone: 'neutral' | 'positive' | 'today' | 'negative') {
  if (tone === 'positive') {
    return {
      shell: 'border-[rgba(78,143,58,0.28)] bg-[linear-gradient(135deg,rgba(78,143,58,0.16),rgba(255,255,255,0.98))]',
      kicker: 'text-[var(--green-700)]',
      value: 'text-[var(--green-800)]',
      detail: 'text-[var(--green-800)]/80',
    };
  }

  if (tone === 'today') {
    return {
      shell: 'border-[rgba(15,23,42,0.16)] bg-[linear-gradient(135deg,rgba(15,23,42,0.08),rgba(255,255,255,0.98))]',
      kicker: 'text-[var(--ink)]',
      value: 'text-[var(--ink)]',
      detail: 'text-[var(--ink-soft)]',
    };
  }

  if (tone === 'negative') {
    return {
      shell: 'border-[rgba(220,38,38,0.28)] bg-[linear-gradient(135deg,rgba(248,113,113,0.18),rgba(255,255,255,0.98))]',
      kicker: 'text-red-700',
      value: 'text-red-700',
      detail: 'text-red-700/80',
    };
  }

  return {
    shell: 'border-[var(--stroke)] bg-[var(--bg-app)]',
    kicker: 'text-[var(--ink-soft)]',
    value: 'text-[var(--ink)]',
    detail: 'text-[var(--ink-soft)]',
  };
}

function sizeClasses(size: 'sm' | 'lg') {
  if (size === 'lg') {
    return {
      container: 'p-4 md:p-5',
      kicker: 'text-xs',
      value: 'text-4xl md:text-5xl',
      detail: 'text-sm',
    };
  }

  return {
    container: 'p-3.5',
    kicker: 'text-[0.65rem]',
    value: 'text-2xl md:text-3xl',
    detail: 'text-xs',
  };
}

export function AlertCountdownBadge({ daysRemaining, size = 'sm', className }: AlertCountdownBadgeProps) {
  const tone = badgeTone(daysRemaining);
  const toneClass = toneClasses(tone);
  const sizeClass = sizeClasses(size);

  const value =
    daysRemaining === null
      ? 'Sin fecha'
      : daysRemaining === 0
        ? 'Hoy'
        : String(daysRemaining);

  const kicker =
    daysRemaining === null
      ? 'Fecha estimada'
      : daysRemaining > 0
        ? 'Faltan'
        : daysRemaining === 0
          ? 'Hoy'
          : 'Retraso';

  const detail =
    daysRemaining === null
      ? 'No hay fecha estimada disponible'
      : daysRemaining > 0
        ? daysRemaining === 1
          ? 'día hasta la publicación'
          : 'días hasta la publicación'
        : daysRemaining === 0
          ? 'La publicación estimada es hoy'
          : Math.abs(daysRemaining) === 1
            ? 'día de retraso'
            : 'días de retraso';

  return (
    <div
      className={[
        'rounded-2xl border shadow-card',
        toneClass.shell,
        sizeClass.container,
        className || '',
      ].join(' ')}
    >
      <p className={['font-bold uppercase tracking-[0.22em]', toneClass.kicker, sizeClass.kicker].join(' ')}>
        {kicker}
      </p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className={['font-black leading-none tracking-tight', toneClass.value, sizeClass.value].join(' ')}>
          {value}
        </p>
        {daysRemaining !== null && daysRemaining !== 0 ? (
          <span className={['text-sm font-semibold', toneClass.detail].join(' ')}>
            {daysRemaining > 0 ? 'días' : 'días'}
          </span>
        ) : null}
      </div>
      <p className={['mt-2 font-medium', toneClass.detail, sizeClass.detail].join(' ')}>
        {detail}
      </p>
    </div>
  );
}
