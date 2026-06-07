import Link from 'next/link';
import type { HTMLAttributes, ReactNode } from 'react';
import { Reveal } from './motion-primitives';

type Tone = 'green' | 'gold' | 'cyan' | 'ink';

const toneStyles: Record<Tone, string> = {
  green: 'text-[var(--green-700)] bg-[rgba(22,112,85,0.10)] border-[rgba(22,112,85,0.18)]',
  gold: 'text-[var(--green-900)] bg-[rgba(244,197,66,0.18)] border-[rgba(244,197,66,0.32)]',
  cyan: 'text-[var(--cyan-700)] bg-[rgba(54,189,248,0.10)] border-[rgba(54,189,248,0.18)]',
  ink: 'text-[var(--ink)] bg-white border-[var(--stroke)]',
};

export function Eyebrow({ children, tone = 'green' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] ${toneStyles[tone]}`}>
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
  variant?: 'primary' | 'secondary' | 'dark';
  className?: string;
}) {
  const base = 'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold shadow-sm transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]';
  const variants = {
    primary: 'bg-[var(--green-700)] text-white hover:bg-[var(--green-900)]',
    secondary: 'border border-[var(--stroke)] bg-white text-[var(--ink)] hover:bg-[var(--bg-eco)]',
    dark: 'bg-[var(--ink)] text-white hover:bg-black',
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
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
  tone?: Tone;
}) {
  return (
    <Reveal>
      <section className="ds-hero">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[rgba(244,197,66,0.18)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[rgba(54,189,248,0.10)] blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
            <h1 className="display-type mt-4 max-w-4xl text-4xl font-black leading-[0.98] tracking-tight text-[var(--ink)] md:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--ink-soft)] md:text-lg">{description}</p>
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
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">{eyebrow}</p> : null}
        <h2 className="display-type mt-1 text-2xl font-black text-[var(--ink)] md:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function SurfaceCard({
  children,
  className = '',
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLElement>) {
  return <article className={`ds-card ${className}`} {...props}>{children}</article>;
}

export function MetricCard({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
  return (
    <SurfaceCard>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--ink-soft)]">{label}</p>
      <p className="display-type mt-2 text-3xl font-black text-[var(--ink)]">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{detail}</p> : null}
    </SurfaceCard>
  );
}
