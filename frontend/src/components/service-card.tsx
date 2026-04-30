import Link from 'next/link';
import type { ReactNode } from 'react';
import { ProfileCard } from './profile-card';
import { StatusPill } from './status-pill';

type ServiceCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  statusLabel: string;
  statusTone?: 'active' | 'locked' | 'warning' | 'neutral';
  cta?: {
    label: string;
    href: string;
    variant?: 'solid' | 'ghost';
  };
  children?: ReactNode;
};

const ctaStyles = {
  solid: 'bg-[var(--green-500)] text-white hover:bg-[var(--green-700)]',
  ghost: 'border border-[var(--stroke)] bg-[var(--bg-app)] text-[var(--ink)] hover:bg-[var(--bg-eco)]',
};

export function ServiceCard({
  eyebrow,
  title,
  description,
  statusLabel,
  statusTone = 'neutral',
  cta,
  children,
}: ServiceCardProps) {
  const ctaVariant = cta?.variant ?? 'solid';

  return (
    <ProfileCard className="hover-lift flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[var(--green-700)]">{eyebrow}</p>
          <h3 className="mt-2 text-xl font-bold text-[var(--ink)]">{title}</h3>
        </div>
        <StatusPill label={statusLabel} tone={statusTone} />
      </div>
      <p className="text-sm leading-6 text-[var(--ink-soft)]">{description}</p>
      {children ? <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">{children}</div> : null}
      {cta ? (
        <Link
          href={cta.href}
          className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${ctaStyles[ctaVariant]}`}
        >
          {cta.label}
        </Link>
      ) : null}
    </ProfileCard>
  );
}
