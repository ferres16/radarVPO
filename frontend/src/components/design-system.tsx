import Link from 'next/link';
import type { HTMLAttributes, ReactNode } from 'react';
import { Reveal } from './motion-primitives';

type Tone = 'green' | 'gold' | 'cyan' | 'ink';

const toneStyles: Record<Tone, string> = {
  green: 'text-[var(--green-700)] bg-[rgba(22,112,85,0.10)] border-[rgba(22,112,85,0.18)]',
  gold: 'text-[#7a5600] bg-[rgba(232,184,74,0.16)] border-[rgba(232,184,74,0.28)]',
  cyan: 'text-[var(--cyan-700)] bg-[rgba(54,189,248,0.10)] border-[rgba(54,189,248,0.18)]',
  ink: 'text-[var(--ink)] bg-white/80 border-[var(--stroke)]',
};

export function Eyebrow({ children, tone = 'green' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${toneStyles[tone]}`}>
      {children}
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  block = false,
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  className?: string;
  block?: boolean;
}) {
  const classes = [
    'btn',
    variant === 'primary' ? 'btn--primary' : 'btn--secondary',
    size === 'lg' ? 'btn--lg' : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
  tone?: Tone;
  dark?: boolean;
}) {
  return (
    <Reveal>
      <section className="lp-page-hero">
        <div className="lp-page-hero__backdrop" aria-hidden="true" />
        <div className="lp-page-hero__inner">
          <span className="lp-hero__badge">{eyebrow}</span>
          <h1 className="lp-page-hero__title">{title}</h1>
          <p className="lp-page-hero__subtitle">{description}</p>
          {actions ? <div className="lp-hero__actions">{actions}</div> : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </section>
    </Reveal>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  light?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="lp-eyebrow">{eyebrow}</p> : null}
        <h2 className={`lp-title ${light ? '!text-white' : ''}`}>{title}</h2>
        {description ? (
          <p className={`lp-lead ${light ? '!text-white/70' : ''}`}>{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function SurfaceCard({
  children,
  className = '',
  premium = false,
  ...props
}: { children: ReactNode; className?: string; premium?: boolean } & HTMLAttributes<HTMLElement>) {
  return (
    <article className={`public-card ${premium ? 'public-card--hover' : ''} ${className}`} {...props}>
      {children}
    </article>
  );
}

export function SectionBand({
  children,
  className = '',
  variant = 'default',
}: {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'alt' | 'muted';
}) {
  const variantClass =
    variant === 'alt' ? 'section-band--alt' : variant === 'muted' ? 'section-band--muted' : '';
  return <section className={`section-band ${variantClass} ${className}`}>{children}</section>;
}

export function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <SurfaceCard premium className="p-6">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-eco)] text-sm font-black text-[var(--green-700)] ring-1 ring-[rgba(22,112,85,0.12)]">
        {step}
      </span>
      <h3 className="mt-4 text-lg font-black text-[var(--ink)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{description}</p>
    </SurfaceCard>
  );
}

export function MetricCard({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
  return (
    <SurfaceCard premium className="flex min-h-32 flex-col items-center justify-center p-5 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{label}</p>
      <p className="display-type mt-2 text-4xl font-black text-[var(--ink)]">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{detail}</p> : null}
    </SurfaceCard>
  );
}

export function FormField({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">
        {label}
      </label>
      {children}
      {hint ? <p className="form-field__hint">{hint}</p> : null}
    </div>
  );
}
