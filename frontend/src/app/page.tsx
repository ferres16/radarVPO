import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getDaysRemaining } from '@/lib/alert-countdown';
import { copy } from '@/lib/navigation';
import { howItWorksSteps, proHref, proIncludes, proPlan, proSolutionPoints } from '@/lib/pro';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { CourseProductCard } from '@/components/course-product-card';
import { ButtonLink, Eyebrow, SectionBand, SectionHeader } from '@/components/design-system';
import { RadarVisual } from '@/components/radar-visual';
import { StickyProCta } from '@/components/sticky-pro-cta';
import { StructuredData } from '@/components/structured-data';
import { createMetadata, faqJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Aprende, prepárate y recibe alertas para conseguir una VPO en Cataluña',
  description:
    'Cursos, guías y alertas de próximos lanzamientos VPO. Activa VPO PRO y llega preparado antes que los demás.',
  path: '/',
  keywords: ['curso VPO', 'VPO PRO', 'vivienda protegida Cataluña', 'próximos lanzamientos'],
});

const faqs = [
  {
    question: '¿Qué es Radar VPO?',
    answer: 'Una plataforma premium para prepararte, formarte y recibir alertas de vivienda protegida en Cataluña.',
  },
  {
    question: '¿Qué incluye VPO PRO?',
    answer: 'Alertas prioritarias, curso completo, guía práctica, checklist y actualizaciones del mercado.',
  },
  {
    question: '¿Garantiza conseguir vivienda?',
    answer: 'No. Te ayuda a enterarte antes y prepararte. La adjudicación depende de los organismos oficiales.',
  },
];

const heroBenefits = [
  'Alertas de próximos lanzamientos',
  'Curso completo VPO',
  'Guía práctica',
  'Acompañamiento personalizado',
];

const problemCards = [
  'No sabe dónde mirar',
  'No tiene documentos preparados',
  'Se entera cuando ya es tarde',
];

export default async function Home() {
  const [promotions, alerts, courses] = await Promise.all([
    api.getPromotions('?limit=4').catch(() => []),
    api.getAlerts().catch(() => []),
    api.listCourses().catch(() => []),
  ]);

  const visibleCourses = [...courses].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  const featuredCourses = visibleCourses.slice(0, 3);
  const recentPromotions = promotions.filter((item) => item.status !== 'archived').slice(0, 3);
  const upcomingLaunches = alerts
    .filter((item) => item.type === 'alert')
    .slice(0, 2)
    .map((item) => ({ item, daysRemaining: getDaysRemaining(item.estimatedPublicationDate) }));

  return (
    <main className="shell space-y-10 pb-20 md:space-y-14 md:pb-16">
      <StructuredData data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(faqs)]} />
      <StickyProCta />

      <section className="section-band mesh-bg relative overflow-hidden px-4 py-8 sm:px-6 md:px-10 md:py-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[rgba(54,189,248,0.14)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-[rgba(22,112,85,0.14)] blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="order-2 lg:order-1">
            <Eyebrow tone="cyan">Plataforma premium VPO</Eyebrow>
            <h1 className="display-type mt-3 text-[1.75rem] font-black leading-[1.08] tracking-tight text-[var(--ink)] sm:text-4xl md:mt-4 md:text-5xl lg:text-[3.35rem]">
              Aprende, prepárate y recibe alertas para conseguir una VPO en Cataluña
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-soft)] md:mt-4 md:text-lg md:leading-7">
              Cursos, guías y próximos lanzamientos para llegar antes que los demás.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 md:mt-7 md:gap-3">
              <ButtonLink href="/cursos">Ver cursos</ButtonLink>
              <ButtonLink href={proHref} variant="secondary">{proPlan.ctaLabel}</ButtonLink>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 md:mt-6">
              {heroBenefits.map((benefit) => (
                <span key={benefit} className="benefit-pill">{benefit}</span>
              ))}
            </div>
          </div>
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="radar-shell">
              <RadarVisual />
            </div>
          </div>
        </div>
      </section>

      <SectionBand variant="alt" className="space-y-5">
        <div className="text-center">
          <Eyebrow tone="cyan">El problema</Eyebrow>
          <h2 className="display-type mt-3 text-2xl font-black text-white md:text-4xl">
            La mayoría llega tarde a las promociones
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {problemCards.map((item) => (
            <div key={item} className="problem-chip text-center">{item}</div>
          ))}
        </div>
      </SectionBand>

      <section className="space-y-5">
        <SectionHeader
          eyebrow="La solución"
          title="Radar VPO te pone por delante"
          description="Entiende el proceso, prepara documentación, recibe alertas y actúa rápido."
        />
        <div className="feature-grid">
          {proSolutionPoints.map((point) => (
            <article key={point.title} className="feature-grid__item">
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </article>
          ))}
        </div>
      </section>

      {featuredCourses.length > 0 ? (
        <section className="space-y-6">
          <SectionHeader
            eyebrow="Formación"
            title="Cursos para llegar preparado"
            description="Productos premium con temario claro, progreso visual y acceso según tu plan."
            action={<ButtonLink href="/cursos" variant="ghost">Ver todos</ButtonLink>}
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseProductCard key={course.id} course={course} showCta />
            ))}
          </div>
        </section>
      ) : null}

      <section className="conversion-panel px-5 py-10 md:px-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <Eyebrow tone="gold">VPO PRO</Eyebrow>
            <h2 className="display-type mt-4 text-3xl font-black text-white md:text-4xl">
              Todo lo que necesitas para no llegar tarde
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
              Alertas, guía, cursos, checklist y actualizaciones en una sola suscripción.
            </p>
            <div className="mt-6">
              <ButtonLink href={proHref} className="!bg-white !text-[var(--ink)] hover:!bg-[var(--bg-eco)]">
                {proPlan.ctaLabel}
              </ButtonLink>
              <p className="mt-3 text-sm font-semibold text-white/55">{proPlan.price}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {proIncludes.map((item) => (
              <div key={item.title} className="glass-panel p-4">
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                <h3 className="mt-2 text-sm font-black text-white">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-white/65">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band space-y-5">
        <SectionHeader
          eyebrow="Acompañamiento"
          title="Te ayudamos a revisar tu caso y preparar tu estrategia"
          description="Revisión de requisitos, documentación y plan de acción personalizado."
          action={<ButtonLink href="/acompanamiento" variant="secondary">Solicitar acompañamiento</ButtonLink>}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {howItWorksSteps.slice(0, 3).map((step) => (
            <article key={step.step} className="rounded-2xl border border-[var(--stroke)] bg-white/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--green-700)]">Paso {step.step}</p>
              <h3 className="mt-2 text-base font-black text-[var(--ink)]">{step.title}</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {(upcomingLaunches.length > 0 || recentPromotions.length > 0) ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionHeader
              eyebrow="Soporte comercial"
              title={copy.upcomingLaunches}
              action={<ButtonLink href="/alerts" variant="ghost">Ver todos</ButtonLink>}
            />
            {upcomingLaunches.length > 0 ? (
              <div className="content-list">
                {upcomingLaunches.map(({ item, daysRemaining }) => (
                  <Link key={item.id} href={`/promotions/${item.id}`} className="content-list__item group">
                    <AlertCountdownBadge daysRemaining={daysRemaining} size="sm" />
                    <h3 className="mt-2 text-sm font-black text-[var(--ink)] group-hover:text-[var(--green-700)]">{item.title}</h3>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--ink-soft)]">Activa VPO PRO para recibir el siguiente aviso.</p>
            )}
          </div>
          <div className="space-y-4">
            <SectionHeader
              eyebrow="Oportunidades"
              title={copy.publishedPromotions}
              action={<ButtonLink href="/promotions" variant="ghost">Ver todas</ButtonLink>}
            />
            {recentPromotions.length > 0 ? (
              <div className="content-list">
                {recentPromotions.map((promotion) => (
                  <Link key={promotion.id} href={`/promotions/${promotion.id}`} className="content-list__item group">
                    <h3 className="text-sm font-black text-[var(--ink)] group-hover:text-[var(--green-700)]">{promotion.title}</h3>
                    <p className="mt-1 text-xs text-[var(--ink-soft)]">{promotion.municipality || 'Cataluña'}</p>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="conversion-panel px-6 py-12 text-center md:px-10 md:py-16">
        <h2 className="display-type text-2xl font-black text-white md:text-4xl">
          Empieza hoy a prepararte para tu próxima oportunidad VPO
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/cursos" className="!bg-white !text-[var(--ink)] hover:!bg-[var(--bg-eco)]">
            Ver cursos
          </ButtonLink>
          <ButtonLink href={proHref} variant="secondary" className="!border-white/25 !bg-white/10 !text-white hover:!bg-white/20">
            {proPlan.ctaLabel}
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
