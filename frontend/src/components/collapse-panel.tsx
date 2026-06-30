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

const alwaysOpenClass = {
  md: 'collapse-panel--always-open-md',
  lg: 'collapse-panel--always-open-lg',
} as const;

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
  const openClass = alwaysOpenFrom ? alwaysOpenClass[alwaysOpenFrom] : '';

  return (
    <details
      className={`collapse-panel ${openClass} ${className}`.trim()}
      open={defaultOpen || undefined}
    >
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
          <svg
            className="collapse-panel__chevron h-4 w-4 text-[var(--ink-soft)]"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </summary>
      <div className={`collapse-panel__body ${bodyClassName}`.trim()}>{children}</div>
    </details>
  );
}
