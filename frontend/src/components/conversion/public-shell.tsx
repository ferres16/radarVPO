import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion-primitives';
import { ButtonLink } from '@/components/design-system';
import { proHref, proPlan } from '@/lib/pro';

export function PublicPage({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={['lp', 'lp--inner', 'lp--app', className].filter(Boolean).join(' ')}>{children}</main>;
}

export function PublicPageHero({
  badge,
  title,
  titleAccent,
  description,
  actions,
  proof,
  visual,
  trustNote,
}: {
  badge: string;
  title: string;
  titleAccent?: string;
  description: string;
  actions?: ReactNode;
  proof?: readonly string[];
  visual?: ReactNode;
  trustNote?: string;
}) {
  const hasSplit = Boolean(visual);

  return (
    <Reveal>
      <section className={`lp-page-hero ${hasSplit ? 'lp-page-hero--split' : ''}`}>
        <div className="lp-page-hero__backdrop" aria-hidden="true" />
        <div className="shell">
          <div className={hasSplit ? 'page-hero-split' : 'lp-page-hero__inner'}>
            <div className="page-hero-split__copy">
              <span className="lp-hero__badge">{badge}</span>
              <h1 className="lp-page-hero__title">
                {title}
                {titleAccent ? <span className="lp-hero__title-accent"> {titleAccent}</span> : null}
              </h1>
              <p className="lp-page-hero__subtitle">{description}</p>
              {proof && proof.length > 0 ? (
                <ul className="lp-hero__proof lp-hero__proof--compact" aria-label="Beneficios">
                  {proof.map((item) => (
                    <li key={item}>
                      <span className="lp-hero__proof-mark" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              {actions ? <div className="lp-hero__actions lp-hero__actions--stack">{actions}</div> : null}
              {trustNote ? <p className="lp-hero__price">{trustNote}</p> : null}
            </div>
            {visual ? <div className="page-hero-split__visual order-first md:order-none">{visual}</div> : null}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

export function PublicSection({
  children,
  className = '',
  muted = false,
  border = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
  border?: boolean;
  id?: string;
}) {
  const variant = [muted ? 'lp-section--muted' : '', border ? 'lp-section--border' : ''].filter(Boolean).join(' ');
  return (
    <Reveal>
      <section id={id} className={`lp-section ${variant} ${className}`.trim()}>
        <div className="shell">{children}</div>
      </section>
    </Reveal>
  );
}

export function PublicProBanner({
  title = '¿No quieres revisar cada día?',
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Reveal>
      <div className="shell">
        <aside className="public-pro-banner">
          <div>
            <p className="public-pro-banner__label">{proPlan.name}</p>
            <p className="public-pro-banner__title">{title}</p>
            <p className="public-pro-banner__text">
              {description || `Recibe alertas por SMS y email cuando detectemos oportunidades. ${proPlan.price}`}
            </p>
          </div>
          <ButtonLink href={proHref} size="lg" block className="shrink-0 md:!inline-flex">
            {proPlan.ctaLabel}
          </ButtonLink>
        </aside>
      </div>
    </Reveal>
  );
}

export function PublicCtaBand({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <section className="lp-section lp-section--border">
        <div className="shell">
          <div className="public-cta-band">
            <div>
              <h2 className="lp-title lp-title--sm">{title}</h2>
              {description ? <p className="lp-lead">{description}</p> : null}
            </div>
            <div className="public-cta-band__actions">{children}</div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
