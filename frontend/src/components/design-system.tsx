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
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'dark' | 'ghost';
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)] focus-visible:ring-offset-2';
  const variants = {
    primary: 'bg-[var(--green-700)] text-white shadow-glow hover:bg-[var(--green-900)]',
    secondary: 'border border-[var(--stroke-strong)] bg-white/90 text-[var(--ink)] shadow-sm hover:border-[rgba(22,112,85,0.22)] hover:bg-[var(--bg-eco)]',
    dark: 'bg-[var(--ink)] text-white shadow-card hover:bg-black',
    ghost: 'text-[var(--green-700)] hover:bg-[rgba(22,112,85,0.08)]',
  };

  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={`${base} ${variants[variant]} ${className}`} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
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
  tone = 'green',
  dark = false,
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
      <section className={`ds-hero mesh-bg ${dark ? 'section-band--alt !border-white/10' : ''}`}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[rgba(232,184,74,0.14)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[rgba(54,189,248,0.12)] blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Eyebrow tone={dark ? 'cyan' : tone}>{eyebrow}</Eyebrow>
            <h1 className={`display-type mt-4 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight md:text-5xl lg:text-6xl ${dark ? 'text-white' : 'text-[var(--ink)]'}`}>
              {title}
            </h1>
            <p className={`mt-4 max-w-2xl text-base leading-7 md:text-lg ${dark ? 'text-white/75' : 'text-[var(--ink-soft)]'}`}>{description}</p>
            {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
          {children ? <div>{children}</div> : null}
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
        {eyebrow ? (
          <p className={`text-xs font-bold uppercase tracking-[0.16em] ${light ? 'text-emerald-300' : 'text-[var(--green-700)]'}`}>{eyebrow}</p>
        ) : null}
        <h2 className={`display-type mt-1 text-2xl font-black md:text-3xl ${light ? 'text-white' : 'text-[var(--ink)]'}`}>{title}</h2>
        {description ? (
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${light ? 'text-white/70' : 'text-[var(--ink-soft)]'}`}>{description}</p>
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
    <article className={`${premium ? 'premium-card' : 'ds-card'} ${className}`} {...props}>
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
