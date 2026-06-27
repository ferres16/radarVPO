import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getDaysRemaining } from '@/lib/alert-countdown';
import { copy } from '@/lib/navigation';
import { howItWorksSteps, proHref, proIncludes, proPlan, proSolutionPoints } from '@/lib/pro';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { ButtonLink, Eyebrow, SectionBand, SectionHeader } from '@/components/design-system';
import { ProComparison } from '@/components/pro-comparison';
import { RadarVisual } from '@/components/radar-visual';
import { StickyProCta } from '@/components/sticky-pro-cta';
import { StructuredData } from '@/components/structured-data';
import { createMetadata, faqJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Detecta oportunidades de vivienda protegida antes que nadie',
  description:
    'Radar VPO monitoriza próximos lanzamientos y promociones publicadas en Cataluña. Activa VPO PRO y llega preparado.',
  path: '/',
  keywords: ['VPO PRO', 'próximos lanzamientos vivienda protegida', 'promociones publicadas Cataluña'],
});

const faqs = [
  {
    question: '¿Qué es Radar VPO?',
    answer: 'Una plataforma que detecta próximos lanzamientos y promociones de vivienda protegida en Cataluña para que actúes con ventaja.',
  },
  {
    question: '¿Qué incluye VPO PRO?',
    answer: 'Notificaciones prioritarias, seguimiento de municipios, curso de iniciación y guía completa del proceso.',
  },
  {
    question: '¿Garantiza conseguir vivienda?',
    answer: 'No. Te ayuda a enterarte antes y prepararte. La adjudicación depende de los organismos oficiales.',
  },
];

const problemSteps = [
  { label: 'Promoción publicada', state: 'done' },
  { label: 'Plazo abierto', state: 'active' },
  { label: 'Plazas agotadas', state: 'late' },
];

export default async function Home() {
  const [promotions, alerts] = await Promise.all([
    api.getPromotions('?limit=4').catch(() => []),
    api.getAlerts().catch(() => []),
  ]);

  const recentPromotions = promotions.filter((item) => item.status !== 'archived').slice(0, 4);
  const upcomingCount = alerts.filter((item) => item.type === 'alert').length;
  const publishedCount = promotions.filter((item) => item.status !== 'archived').length;
  const upcomingLaunches = alerts
    .filter((item) => item.type === 'alert')
    .slice(0, 3)
    .map((item) => ({ item, daysRemaining: getDaysRemaining(item.estimatedPublicationDate) }));

  return (
    <main className="shell space-y-10 pb-20 md:space-y-16 md:pb-16">
      <StructuredData data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(faqs)]} />
      <StickyProCta />

      <section className="section-band mesh-bg relative overflow-hidden px-4 py-8 sm:px-6 md:px-10 md:py-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[rgba(54,189,248,0.12)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-[rgba(22,112,85,0.14)] blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div className="order-2 lg:order-1">
            <Eyebrow tone="cyan">Monitorización inteligente</Eyebrow>
            <h1 className="display-type mt-3 text-3xl font-black leading-[1.05] tracking-tight text-[var(--ink)] sm:text-4xl md:mt-4 md:text-5xl lg:text-6xl">
              Detecta oportunidades de VPO antes que los demás
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-soft)] md:mt-5 md:text-lg md:leading-7">
              Radar VPO rastrea próximos lanzamientos y promociones publicadas en Cataluña para que no llegues tarde al plazo.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 md:mt-7 md:gap-3">
              <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
              <ButtonLink href="/alerts" variant="secondary">Ver lanzamientos</ButtonLink>
            </div>
            <p className="mt-3 text-xs font-bold text-[var(--green-700)] md:text-sm">{proPlan.price}</p>
          </div>
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="radar-shell">
              <RadarVisual />
              <p className="pointer-events-none absolute -bottom-1 left-1/2 w-max -translate-x-1/2 rounded-full border border-[var(--stroke)] bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cyan-700)] shadow-sm md:hidden">
                Radar activo
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="stat-strip" aria-label="Métricas clave">
        <div className="stat-strip__item">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">Próximos lanzamientos</p>
          <p className="display-type mt-2 text-3xl font-black text-[var(--ink)] md:text-4xl">{upcomingCount}</p>
        </div>
        <div className="stat-strip__item">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">Promociones publicadas</p>
          <p className="display-type mt-2 text-3xl font-black text-[var(--ink)] md:text-4xl">{publishedCount}</p>
        </div>
        <div className="stat-strip__item">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">Monitorización</p>
          <p className="display-type mt-2 text-3xl font-black text-[var(--ink)] md:text-4xl">24/7</p>
        </div>
      </section>

      <section className="space-y-4 md:space-y-5">
        <SectionHeader
          eyebrow="Anticipación"
          title={copy.upcomingLaunches}
          description={copy.upcomingLaunchesDesc}
          action={<ButtonLink href="/alerts" variant="ghost">Ver todos</ButtonLink>}
        />
        {upcomingLaunches.length > 0 ? (
          <div className="content-list">
            {upcomingLaunches.map(({ item, daysRemaining }) => (
              <Link key={item.id} href={`/promotions/${item.id}`} className="content-list__item group">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <AlertCountdownBadge daysRemaining={daysRemaining} size="lg" />
                    <h3 className="mt-3 text-base font-black text-[var(--ink)] group-hover:text-[var(--green-700)]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{item.municipality || 'Cataluña'}</p>
                  </div>
                  <span className="text-sm font-bold text-[var(--green-700)]">Ver detalle →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--stroke)] px-6 py-8 text-center">
            <p className="text-sm text-[var(--ink-soft)]">Ahora mismo no hay lanzamientos previstos visibles. Activa VPO PRO para recibir el siguiente.</p>
            <div className="mt-5">
              <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
            </div>
          </div>
        )}
      </section>

      <SectionBand variant="muted" className="space-y-5">
        <SectionHeader
          eyebrow="Oportunidades abiertas"
          title={copy.publishedPromotions}
          description={copy.publishedPromotionsDesc}
          action={<ButtonLink href="/promotions" variant="secondary">Ver todas</ButtonLink>}
        />
        {recentPromotions.length > 0 ? (
          <div className="content-list border-none">
            {recentPromotions.map((promotion) => (
              <Link key={promotion.id} href={`/promotions/${promotion.id}`} className="content-list__item group">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">{promotion.municipality || 'Cataluña'}</p>
                <h3 className="mt-1 line-clamp-2 text-base font-black text-[var(--ink)] group-hover:text-[var(--green-700)]">
                  {promotion.title}
                </h3>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-[var(--ink-soft)]">No hay promociones publicadas ahora mismo.</p>
        )}
      </SectionBand>

      <ProComparison />

      <section className="space-y-5">
        <div>
          <Eyebrow>{copy.howItWorks}</Eyebrow>
          <h2 className="display-type mt-3 text-3xl font-black text-[var(--ink)] md:text-4xl">
            De la señal al plazo, en cuatro pasos
          </h2>
        </div>
        <div className="step-line">
          {howItWorksSteps.map((step) => (
            <article key={step.step} className="step-line__item">
              <span>Paso {step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <SectionBand variant="alt" className="text-center">
        <Eyebrow tone="cyan">El problema</Eyebrow>
        <h2 className="display-type mt-4 text-3xl font-black text-white md:text-4xl">
          La mayoría llega tarde a las promociones
        </h2>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {problemSteps.map((step, index) => (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                  step.state === 'late'
                    ? 'border-red-400/30 bg-red-500/15 text-red-200'
                    : step.state === 'active'
                      ? 'border-amber-400/30 bg-amber-500/15 text-amber-100'
                      : 'border-white/15 bg-white/10 text-white/70'
                }`}
              >
                {step.label}
              </div>
              {index < problemSteps.length - 1 ? (
                <span className="hidden text-white/40 sm:inline" aria-hidden="true">→</span>
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-white/65">Cuando lo descubres, el plazo ya está cerrado o las plazas agotadas.</p>
      </SectionBand>

      <section className="space-y-5">
        <div>
          <Eyebrow>La solución</Eyebrow>
          <h2 className="display-type mt-3 text-3xl font-black text-[var(--ink)]">Radar VPO trabaja por ti</h2>
        </div>
        <div className="feature-grid">
          {proSolutionPoints.map((point) => (
            <article key={point.title} className="feature-grid__item">
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </article>
          ))}
        </div>
      </section>

      <SectionBand className="relative space-y-8 overflow-hidden">
        <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-[rgba(22,112,85,0.12)] blur-3xl" />
        <div className="relative text-center">
          <Eyebrow tone="gold">{proPlan.name}</Eyebrow>
          <h2 className="display-type mt-4 text-3xl font-black text-[var(--ink)] md:text-4xl">
            Tu ventaja competitiva en vivienda protegida
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] md:text-base">
            Notificaciones prioritarias, seguimiento de municipios, formación y guía completa.
          </p>
        </div>
        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {proIncludes.map((item) => (
            <article key={item.title} className="border-l-2 border-[var(--green-700)] pl-4">
              <span className="text-xl" aria-hidden="true">{item.icon}</span>
              <h3 className="mt-2 text-base font-black text-[var(--ink)]">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-[var(--ink-soft)]">{item.description}</p>
            </article>
          ))}
        </div>
        <div className="relative text-center">
          <ButtonLink href={proHref}>{proPlan.ctaLabel} · {proPlan.price}</ButtonLink>
        </div>
      </SectionBand>

      <section className="section-band--alt section-band px-6 py-12 text-center md:px-10 md:py-16">
        <h2 className="display-type text-3xl font-black text-white md:text-5xl">Empieza hoy con ventaja</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/75 md:text-base">
          Deja de depender de revisar portales. Detecta lanzamientos, recibe notificaciones y prepárate con VPO PRO.
        </p>
        <div className="mt-8">
          <ButtonLink href={proHref} className="!bg-white !text-[var(--ink)] hover:!bg-[var(--bg-eco)]">
            {proPlan.ctaLabel}
          </ButtonLink>
        </div>
        <p className="mt-4 text-sm font-semibold text-white/60">{proPlan.price}</p>
      </section>
    </main>
  );
}
