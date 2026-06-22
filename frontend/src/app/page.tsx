import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { proHref, proIncludes, proPlan, proSolutionPoints } from '@/lib/pro';
import { ButtonLink, Eyebrow, SurfaceCard } from '@/components/design-system';
import { StickyProCta } from '@/components/sticky-pro-cta';
import { StructuredData } from '@/components/structured-data';
import { createMetadata, faqJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Recibe antes que nadie las promociones de vivienda protegida',
  description:
    'Radar VPO monitoriza promociones, adjudicaciones y próximas publicaciones en Cataluña. Activa VPO PRO y recibe alertas prioritarias.',
  path: '/',
  keywords: ['VPO PRO', 'alertas vivienda protegida', 'promociones VPO Cataluña'],
});

const faqs = [
  {
    question: '¿Qué es Radar VPO?',
    answer: 'Un radar que monitoriza vivienda protegida en Cataluña para avisarte antes de que cierren los plazos.',
  },
  {
    question: '¿Qué incluye VPO PRO?',
    answer: 'Alertas prioritarias, seguimiento de municipios, curso de iniciación y guía completa del proceso.',
  },
  {
    question: '¿Garantiza conseguir vivienda?',
    answer: 'No. Te ayuda a enterarte antes y actuar con más margen. La adjudicación depende de los organismos oficiales.',
  },
];

const problemSteps = [
  { label: 'Promoción publicada', state: 'done' },
  { label: 'Plazo abierto', state: 'active' },
  { label: 'Plazas agotadas', state: 'late' },
];

const testimonialsPlaceholder = [
  { quote: 'Espacio reservado para testimonio de usuario Pro.', author: 'Próximamente' },
  { quote: 'Espacio reservado para caso real de alerta a tiempo.', author: 'Próximamente' },
  { quote: 'Espacio reservado para experiencia con el curso.', author: 'Próximamente' },
];

export default async function Home() {
  const promotions = await api.getPromotions('?limit=4').catch(() => []);
  const recentPromotions = promotions.filter((item) => item.status !== 'archived').slice(0, 4);

  return (
    <main className="shell space-y-16 pb-28 md:pb-16">
      <StructuredData data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(faqs)]} />
      <StickyProCta />

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--stroke)] bg-white px-6 py-12 shadow-card md:px-10 md:py-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[rgba(22,112,85,0.08)] blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <Eyebrow>VPO PRO</Eyebrow>
          <h1 className="display-type mt-5 text-4xl font-black leading-[1.02] tracking-tight text-[var(--ink)] md:text-6xl">
            Recibe antes que nadie las nuevas promociones de vivienda protegida en Cataluña
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--ink-soft)] md:text-lg">
            Radar VPO monitoriza promociones, adjudicaciones y próximas publicaciones para que no pierdas oportunidades.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
            <ButtonLink href="/promotions" variant="secondary">Ver promociones</ButtonLink>
          </div>
          <p className="mt-5 text-sm font-bold text-[var(--green-700)]">{proPlan.price}</p>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="mx-auto max-w-4xl text-center">
        <Eyebrow tone="ink">El problema</Eyebrow>
        <h2 className="display-type mt-4 text-3xl font-black text-[var(--ink)] md:text-4xl">
          La mayoría de personas llega tarde a las promociones
        </h2>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {problemSteps.map((step, index) => (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                  step.state === 'late'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : step.state === 'active'
                      ? 'border-amber-200 bg-amber-50 text-amber-800'
                      : 'border-[var(--stroke)] bg-[var(--bg-app)] text-[var(--ink-soft)]'
                }`}
              >
                {step.label}
              </div>
              {index < problemSteps.length - 1 ? (
                <span className="hidden text-[var(--ink-soft)] sm:inline" aria-hidden="true">→</span>
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-[var(--ink-soft)]">Cuando lo descubres, el plazo ya está cerrado o las plazas agotadas.</p>
      </section>

      {/* SOLUCIÓN */}
      <section className="space-y-6">
        <div className="text-center">
          <Eyebrow>La solución</Eyebrow>
          <h2 className="display-type mt-4 text-3xl font-black text-[var(--ink)]">Radar VPO trabaja por ti</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {proSolutionPoints.map((point) => (
            <SurfaceCard key={point.title} className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-eco)] text-xl">✓</div>
              <h3 className="mt-4 text-lg font-black text-[var(--ink)]">{point.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{point.description}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      {/* QUÉ INCLUYE VPO PRO */}
      <section className="space-y-6">
        <div className="text-center">
          <Eyebrow tone="gold">VPO PRO</Eyebrow>
          <h2 className="display-type mt-4 text-3xl font-black text-[var(--ink)]">Qué incluye VPO PRO</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proIncludes.map((item) => (
            <SurfaceCard key={item.title} className="p-5">
              <span className="text-2xl" aria-hidden="true">{item.icon}</span>
              <h3 className="mt-3 text-base font-black text-[var(--ink)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.description}</p>
            </SurfaceCard>
          ))}
        </div>
        <div className="text-center">
          <ButtonLink href={proHref}>{proPlan.ctaLabel} · {proPlan.price}</ButtonLink>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="space-y-6">
        <div className="text-center">
          <Eyebrow tone="cyan">Testimonios</Eyebrow>
          <h2 className="display-type mt-4 text-3xl font-black text-[var(--ink)]">Lo que dicen nuestros usuarios</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonialsPlaceholder.map((item) => (
            <SurfaceCard key={item.author} className="p-5">
              <p className="text-sm italic leading-6 text-[var(--ink-soft)]">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{item.author}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      {/* PROMOCIONES RECIENTES */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Radar activo</Eyebrow>
            <h2 className="display-type mt-4 text-3xl font-black text-[var(--ink)]">Promociones recientes</h2>
          </div>
          <ButtonLink href="/promotions" variant="secondary">Ver todas</ButtonLink>
        </div>
        {recentPromotions.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentPromotions.map((promotion) => (
              <Link
                key={promotion.id}
                href={`/promotions/${promotion.id}`}
                className="group rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card transition hover:-translate-y-1"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
                  {promotion.municipality || 'Cataluña'}
                </p>
                <h3 className="mt-3 line-clamp-2 text-base font-black text-[var(--ink)] group-hover:text-[var(--green-700)]">
                  {promotion.title}
                </h3>
              </Link>
            ))}
          </div>
        ) : (
          <SurfaceCard className="p-8 text-center text-sm text-[var(--ink-soft)]">
            No hay promociones publicadas ahora mismo. Activa VPO PRO para recibir la próxima.
          </SurfaceCard>
        )}
      </section>

      {/* CTA FINAL */}
      <section className="rounded-[2rem] bg-[var(--ink)] px-6 py-12 text-center text-white md:px-10 md:py-16">
        <h2 className="display-type text-3xl font-black md:text-5xl">Empieza hoy</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/75 md:text-base">
          Deja de depender de revisar portales. Recibe alertas y aprende el proceso con VPO PRO.
        </p>
        <div className="mt-8">
          <ButtonLink href={proHref} variant="dark" className="!bg-white !text-[var(--ink)] hover:!bg-[var(--bg-eco)]">
            {proPlan.ctaLabel}
          </ButtonLink>
        </div>
        <p className="mt-4 text-sm font-semibold text-white/60">{proPlan.price}</p>
      </section>
    </main>
  );
}
