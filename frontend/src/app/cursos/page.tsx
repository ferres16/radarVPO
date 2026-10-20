import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { PageViewTracker } from '@/components/conversion/page-view-tracker';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import {
  formatEuro,
  getCoursePrice,
  getGuideTopics,
  isCourseSellable,
  isGuidePdf,
  isIncludedInPro,
} from '@/lib/offer';
import { proPlan } from '@/lib/pro';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import type { Course } from '@/types';

export const metadata: Metadata = createMetadata({
  title: 'Entiende la VPO en Cataluña y empieza a planificar',
  description:
    'Guía general para entender la vivienda protegida en Cataluña: cómo funciona, qué ayudas consultar y cómo estimar hipoteca y ahorro. Pago único y acceso inmediato.',
  path: '/cursos',
  keywords: [
    'guía VPO Cataluña',
    'vivienda protegida',
    'ayudas vivienda',
    'hipoteca VPO',
    'Radar VPO',
  ],
});

const GENERAL_GUIDE_FALLBACK_TOPICS = [
  'Introducción a la vivienda protegida en Cataluña',
  'Conceptos básicos para entender cómo funciona',
  'Ayudas y programas relacionados con la vivienda',
  'Cómo estimar una cuota hipotecaria',
  'Entrada, gastos y ahorro necesario',
  'Qué conviene valorar antes de avanzar',
];

const VISION_ITEMS = [
  {
    title: 'Entiende cómo funciona la VPO',
    body: 'Familiarízate con los conceptos principales de la vivienda protegida en Cataluña y con lo que conviene saber antes de buscar una promoción.',
  },
  {
    title: 'Conoce las ayudas y la financiación',
    body: 'Descubre qué programas puedes consultar, qué condiciones revisar y cómo pueden influir en tu planificación.',
  },
  {
    title: 'Pon números a tu futura vivienda',
    body: 'Aprende a estimar la cuota de una hipoteca y a calcular el dinero necesario para la entrada y los gastos de la compra.',
  },
] as const;

function pickGeneralGuide(courses: Course[]): Course | null {
  const bySlug = [
    'guia-general-vpo',
    'vpo-desde-cero',
    'vpo-inicial',
    'guia-vpo',
  ];
  for (const slug of bySlug) {
    const match = courses.find((course) => course.slug === slug);
    if (match) return match;
  }
  return (
    courses.find((course) => isGuidePdf(course) && isCourseSellable(course)) ||
    courses.find(isCourseSellable) ||
    courses[0] ||
    null
  );
}

export default async function CoursesPage() {
  const courses = await api.listCourses().catch(() => []);
  const visibleCourses = [...courses].sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title),
  );
  const generalGuide = pickGeneralGuide(visibleCourses);
  const generalPrice = generalGuide ? getCoursePrice(generalGuide) : null;
  const generalSellable = generalGuide ? isCourseSellable(generalGuide) : false;
  const generalHref = generalGuide ? `/cursos/${generalGuide.slug}` : '/cursos#guia-general';
  const generalTopics =
    (generalGuide && getGuideTopics(generalGuide).length > 0
      ? getGuideTopics(generalGuide)
      : GENERAL_GUIDE_FALLBACK_TOPICS);
  const otherGuides = generalGuide
    ? visibleCourses.filter((course) => course.id !== generalGuide.id)
    : visibleCourses;
  const priceLabel =
    generalPrice !== null ? formatEuro(generalPrice, { decimals: 2 }) : 'Consultar precio';

  return (
    <PublicPage>
      <PageViewTracker event="course_page_viewed" properties={{ page: 'catalog' }} />
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Guías', path: '/cursos' },
        ])}
      />

      <PublicPageHero
        badge="Guías"
        title="Entiende la VPO en Cataluña"
        titleAccent="y empieza a planificar tu vivienda"
        description="Conoce cómo funciona la vivienda protegida, qué ayudas puedes consultar y cómo estimar la hipoteca y el dinero que necesitarías tener ahorrado. Una guía general para entender tus opciones antes de dar el siguiente paso."
        actions={
          <>
            <ButtonLink href={generalHref} size="lg" block>
              {generalSellable
                ? `Ver la guía general · ${priceLabel}`
                : 'Ver la guía general'}
            </ButtonLink>
            <p className="w-full text-sm text-[var(--ink-soft)]">
              Pago único · Formato PDF · Acceso inmediato tras confirmar el pago
            </p>
          </>
        }
      />

      <PublicSection>
        <SectionHeader
          eyebrow="Empieza aquí"
          title="Empieza con una visión clara"
          description="Tres pilares para situarte antes de buscar promoción o presentar nada."
        />
        <div className="lp-why-grid mt-6">
          {VISION_ITEMS.map((item) => (
            <article key={item.title} className="lp-why-card">
              <h2 className="lp-why-card__title">{item.title}</h2>
              <p className="lp-why-card__text">{item.body}</p>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection id="guia-general" muted>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
          Guía general de VPO en Cataluña
        </p>
        <div className="mt-4 public-card overflow-hidden p-0">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-5 md:p-7">
              <h2 className="display-type text-2xl font-black text-[var(--ink)] md:text-3xl">
                {generalGuide?.title || 'VPO desde cero: ayudas, hipoteca y presupuesto'}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] md:text-base">
                {generalGuide?.shortDescription ||
                  generalGuide?.longDescription ||
                  'Para quienes están empezando y quieren comprender el contexto, valorar sus opciones y organizar su presupuesto.'}
              </p>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[var(--green-700)]">
                Qué encontrarás
              </p>
              <ul className="mt-3 space-y-2.5">
                {generalTopics.map((topic) => (
                  <li key={topic} className="flex gap-2.5 text-sm leading-6 text-[var(--ink-soft)]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green-700)]" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="flex flex-col justify-between gap-5 border-t border-[var(--stroke)] bg-[var(--bg-eco)] p-5 md:p-7 lg:border-l lg:border-t-0">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--green-700)]">
                  Acceso
                </p>
                <p className="display-type mt-2 text-3xl font-black text-[var(--ink)]">
                  {priceLabel}
                </p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Guía PDF · pago único
                  {generalGuide && isIncludedInPro(generalGuide)
                    ? ` · incluida en ${proPlan.name} mientras esté activa`
                    : ''}
                </p>
              </div>
              <div className="space-y-3">
                <ButtonLink href={generalHref} size="lg" block>
                  Ver el índice y los detalles →
                </ButtonLink>
                {generalSellable ? (
                  <p className="text-center text-xs text-[var(--ink-soft)]">
                    Entras al contenido en cuanto se confirma el pago
                  </p>
                ) : (
                  <p className="text-center text-xs text-[var(--ink-soft)]">
                    Consulta la ficha para ver el estado de publicación
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </PublicSection>

      <PublicSection id="proximamente">
        <SectionHeader
          eyebrow="Después"
          title="Prepara tu solicitud paso a paso"
          description="Cuando ya entiendas el contexto, toca organizar trámites y papeles."
        />
        <article className="mt-6 public-card p-5 md:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[rgba(232,184,74,0.18)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#7a5600]">
              Próximamente
            </span>
          </div>
          <h3 className="display-type mt-4 text-xl font-black text-[var(--ink)] md:text-2xl">
            Guía de preparación y documentación para solicitar una VPO
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] md:text-base">
            Una guía específica para organizar los pasos de la solicitud, identificar la documentación
            que debes tener preparada y revisar qué necesitas antes de participar en una convocatoria.
          </p>
        </article>
      </PublicSection>

      <PublicSection muted>
        <div className="public-card flex flex-col gap-5 p-5 md:flex-row md:items-end md:justify-between md:p-7">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
              También con {proPlan.name}
            </p>
            <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">
              Pack inicial incluido mientras esté activa
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              En cada ficha se indica qué guías forman parte del pack y cuáles se compran por separado.
              Renovación mensual · {proPlan.price}.
            </p>
          </div>
          <ButtonLink href={proPlan.landingHref} variant="secondary" size="lg">
            Consultar qué incluye PRO →
          </ButtonLink>
        </div>
      </PublicSection>

      <PublicSection id="elige">
        <SectionHeader
          eyebrow="Orientación"
          title="Elige según el momento en el que estás"
          description="No hace falta hacerlo todo a la vez. Empieza por lo que te desbloquea ahora."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="public-card p-5 md:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--green-700)]">
              Ahora
            </p>
            <h3 className="mt-2 text-lg font-black text-[var(--ink)]">
              Entender opciones y planificar presupuesto
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Empieza por la guía general: contexto, ayudas y números antes de mover ficha.
            </p>
            <div className="mt-4">
              <ButtonLink href={generalHref}>Ir a la guía general</ButtonLink>
            </div>
          </article>
          <article className="public-card p-5 md:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7a5600]">
              Después
            </p>
            <h3 className="mt-2 text-lg font-black text-[var(--ink)]">
              Organizar trámites y documentos
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Consulta la guía específica de solicitud cuando esté disponible.
            </p>
            <p className="mt-4 text-sm font-semibold text-[var(--ink-soft)]">Próximamente</p>
          </article>
        </div>
      </PublicSection>

      {otherGuides.length > 0 ? (
        <PublicSection id="catalogo" border>
          <SectionHeader
            eyebrow="Más contenido"
            title="Otras guías publicadas"
            description="Si ya hay más fichas a la venta, las verás aquí."
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {otherGuides.map((course) => {
              const price = getCoursePrice(course);
              return (
                <article key={course.id} className="public-card flex flex-col p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    {isGuidePdf(course) ? 'Guía PDF' : 'Programa'}
                    {isIncludedInPro(course) ? ' · Pack PRO' : ''}
                  </p>
                  <h3 className="mt-2 text-lg font-black text-[var(--ink)]">{course.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[var(--ink-soft)]">
                    {course.shortDescription || 'Contenido publicado en Radar VPO.'}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-base font-black text-[var(--ink)]">
                      {price !== null ? formatEuro(price) : 'Consultar'}
                    </p>
                    <ButtonLink href={`/cursos/${course.slug}`} variant="secondary">
                      Ver
                    </ButtonLink>
                  </div>
                </article>
              );
            })}
          </div>
        </PublicSection>
      ) : null}
    </PublicPage>
  );
}
