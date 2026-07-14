import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-[var(--bg-app)] p-6 text-center">
      <p className="font-semibold text-[var(--ink)]">{title}</p>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
