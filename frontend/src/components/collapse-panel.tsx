import type { ReactNode } from 'react';

type CollapsePanelProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  defaultOpen?: boolean;
  alwaysOpenFrom?: 'md' | 'lg';
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

const breakpointHidden = {
  md: { mobile: 'md:hidden', desktop: 'hidden md:block' },
  lg: { mobile: 'lg:hidden', desktop: 'hidden lg:block' },
} as const;

function PanelHeader({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-black text-[var(--ink)] md:text-base">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs leading-5 text-[var(--ink-soft)] md:text-sm">{subtitle}</p> : null}
      </div>
      {meta ? (
        <span className="shrink-0 rounded-full bg-[var(--bg-app)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

function Chevron() {
  return (
    <svg className="collapse-panel__chevron h-4 w-4 text-[var(--ink-soft)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CollapsePanel({
  title,
  subtitle,
  meta,
  defaultOpen = false,
  alwaysOpenFrom,
  className = '',
  bodyClassName = '',
  children,
}: CollapsePanelProps) {
  const breakpoint = alwaysOpenFrom ? breakpointHidden[alwaysOpenFrom] : null;

  if (breakpoint) {
    return (
      <div className="w-full min-w-0">
        <details className={`collapse-panel ${breakpoint.mobile} ${className}`.trim()} open={defaultOpen || undefined}>
          <summary className="collapse-panel__summary">
            <span className="min-w-0">
              <span className="block text-sm font-black text-[var(--ink)] md:text-base">{title}</span>
              {subtitle ? (
                <span className="mt-0.5 block text-xs leading-5 text-[var(--ink-soft)] md:text-sm">{subtitle}</span>
              ) : null}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {meta ? (
                <span className="rounded-full bg-[var(--bg-app)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                  {meta}
                </span>
              ) : null}
              <Chevron />
            </span>
          </summary>
          <div className={`collapse-panel__body ${bodyClassName}`.trim()}>{children}</div>
        </details>

        <div className={`${breakpoint.desktop} w-full min-w-0 ${className}`.trim()}>
          <PanelHeader title={title} subtitle={subtitle} meta={meta} />
          <div className={`mt-3 ${bodyClassName}`.trim()}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <details className={`collapse-panel ${className}`.trim()} open={defaultOpen || undefined}>
      <summary className="collapse-panel__summary">
        <span className="min-w-0">
          <span className="block text-sm font-black text-[var(--ink)] md:text-base">{title}</span>
          {subtitle ? (
            <span className="mt-0.5 block text-xs leading-5 text-[var(--ink-soft)] md:text-sm">{subtitle}</span>
          ) : null}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {meta ? (
            <span className="rounded-full bg-[var(--bg-app)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              {meta}
            </span>
          ) : null}
          <Chevron />
        </span>
      </summary>
      <div className={`collapse-panel__body ${bodyClassName}`.trim()}>{children}</div>
    </details>
  );
}
