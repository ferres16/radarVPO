import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { CheckoutPanel } from '@/components/checkout/checkout-panel';
import { GuideVpoChapters } from '@/components/conversion/guide-vpo-outline';
import { PageViewTracker } from '@/components/conversion/page-view-tracker';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { CourseCoverImage } from '@/components/course-cover-image';
import { CourseProductCard } from '@/components/course-product-card';
import { ButtonLink, SectionHeader } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import {
  formatEuro,
  getCoursePayBullets,
  getCoursePrice,
  getGuideTopics,
  isCourseSellable,
  isGuidePdf,
} from '@/lib/offer';
import {
  GUIDE_VPO_SEO_DESCRIPTION,
  GUIDE_VPO_SHORT,
  GUIDE_VPO_TITLE,
  getPublicCourseTitle,
  isGuideVpoSlug,
} from '@/lib/guide-vpo';
import { getGuideReadHref, getOwnedCourseSlugs } from '@/lib/owned-courses';
import { publicCatalogCourses } from '@/lib/public-courses';
import { proPlan } from '@/lib/pro';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import type { Course } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: GUIDE_VPO_TITLE,
  description: GUIDE_VPO_SEO_DESCRIPTION,
  path: '/cursos',
  keywords: [
    'guía VPO Cataluña',
    'registro solicitantes VPO',
    'documentación VPO',
    'vivienda protegida Catalunya',
    'Radar VPO',
  ],
});

const VISION_ITEMS = [
  {
    title: 'Saber por dónde empezar',
    body: 'El primer paso no es mirar promociones: es entender el registro, los requisitos y qué papeles vas a necesitar.',
  },
  {
    title: 'Preparar la carpeta a tiempo',
    body: 'Cuando se abre una convocatoria, los plazos son cortos. La guía te dice qué documentación conviene tener lista.',
  },
  {
    title: 'Entender qué compras y qué viene después',
    body: 'Pleno dominio o derecho de superficie, reserva, arras, visado y obligaciones. Antes de firmar, conviene saberlo.',
  },
] as const;

function pickGeneralGuide(courses: Course[]): Course | null {
  const bySlug = [
    'guiav1',
    'guia-vpo',
    'guia-general-vpo',
    'vpo-desde-cero',
    'vpo-inicial',
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
  const [courses, ownedSlugs] = await Promise.all([
    api.listCourses().catch(() => []),
    getOwnedCourseSlugs(),
  ]);
  const visibleCourses = publicCatalogCourses(courses).sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title),
  );
  const generalGuide = pickGeneralGuide(visibleCourses);
  const generalPrice = generalGuide ? getCoursePrice(generalGuide) : null;
  const generalSellable = generalGuide ? isCourseSellable(generalGuide) : false;
  const generalOwned = Boolean(generalGuide && ownedSlugs.has(generalGuide.slug));
  const generalHref = generalGuide ? `/cursos/${generalGuide.slug}` : '#pagar';
  const generalReadHref = generalGuide ? getGuideReadHref(generalGuide.slug) : '/cursos';
  const generalPayHref = generalOwned
    ? generalReadHref
    : generalSellable
      ? '#pagar'
      : generalHref;
  const generalTopics =
    generalGuide && !isGuideVpoSlug(generalGuide.slug) ? getGuideTopics(generalGuide) : [];
  const generalPublicTitle = generalGuide ? getPublicCourseTitle(generalGuide) : GUIDE_VPO_TITLE;
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
        animated={false}
        badge="Guías"
        title="Guía para optar a una VPO:"
        titleAccent="entiende el proceso y qué preparar"
        description="Registro, documentación, financiación y pasos hasta la firma. Precio final, pago único y acceso inmediato."
        actions={
          <>
            <ButtonLink href={generalPayHref} size="lg" block>
              {generalOwned
                ? 'Abrir la guía'
                : generalSellable
                  ? `Pagar ${priceLabel} · pago único`
                  : 'Ver la guía general'}
            </ButtonLink>
            <p className="w-full text-sm text-[var(--ink-soft)]">
              {generalOwned
                ? 'Ya está en tu cuenta. Entra a leerla, sin volver a pagar.'
                : 'Precio, condiciones y pago en la misma ficha. Acceso inmediato al confirmar.'}
            </p>
          </>
        }
      />

      <PublicSection id="pagar" muted className="scroll-mt-24" animated={false}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
          Guía para optar a una vivienda protegida
        </p>
        <div className="mt-4 public-card overflow-hidden p-0">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-5 md:p-7">
              {generalGuide ? (
                <div className="mb-5 overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[#f4efe6]">
                  <CourseCoverImage
                    slug={generalGuide.slug}
                    src={generalGuide.coverImage}
                    alt={`Portada de ${generalPublicTitle}`}
                    className="mx-auto h-auto max-h-80 w-full object-contain object-top"
                    label={generalPublicTitle}
                  />
                </div>
              ) : null}
              <h2 className="display-type text-2xl font-black text-[var(--ink)] md:text-3xl">
                {generalPublicTitle}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] md:text-base">
                {isGuideVpoSlug(generalGuide?.slug)
                  ? GUIDE_VPO_SHORT
                  : generalGuide?.shortDescription ||
                    generalGuide?.longDescription ||
                    'Para quienes están empezando y quieren comprender el contexto, valorar sus opciones y organizar su presupuesto.'}
              </p>
              {!isGuideVpoSlug(generalGuide?.slug) && generalTopics.length > 0 ? (
                <>
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
                </>
              ) : null}
            </div>

            <aside className="border-t border-[var(--stroke)] bg-[var(--bg-eco)] lg:border-l lg:border-t-0">
              {generalOwned && generalGuide ? (
                <div className="flex h-full flex-col justify-between gap-5 p-5 md:p-7">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--green-700)]">
                      Acceso activo
                    </p>
                    <p className="display-type mt-2 text-3xl font-black text-[var(--ink)]">Ya tuya</p>
                    <p className="mt-2 text-sm text-[var(--ink-soft)]">
                      Entra a la guía. No aparece el pago porque ya la tienes.
                    </p>
                  </div>
                  <ButtonLink href={generalReadHref} size="lg" block>
                    Abrir la guía →
                  </ButtonLink>
                </div>
              ) : generalSellable && generalGuide ? (
                <CheckoutPanel
                  layout="embedded"
                  summary={{
                    product: 'course',
                    courseSlug: generalGuide.slug,
                    title: generalPublicTitle,
                    priceLabel,
                    cadenceLabel: 'pago único',
                    recurrenceNote: 'Sin renovaciones. Acceso inmediato al confirmar el pago.',
                    bullets: getCoursePayBullets(generalGuide),
                    backHref: generalHref,
                    backLabel: 'Ver la ficha completa',
                  }}
                />
              ) : (
                <div className="flex h-full flex-col justify-between gap-5 p-5 md:p-7">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--green-700)]">
                      Acceso
                    </p>
                    <p className="display-type mt-2 text-3xl font-black text-[var(--ink)]">{priceLabel}</p>
                    <p className="mt-2 text-sm text-[var(--ink-soft)]">Guía PDF · pago único</p>
                  </div>
                  <ButtonLink href={generalHref} size="lg" block>
                    Ver el índice y los detalles →
                  </ButtonLink>
                </div>
              )}
            </aside>
          </div>
        </div>
      </PublicSection>

      {isGuideVpoSlug(generalGuide?.slug) && !generalOwned ? (
        <PublicSection>
          <GuideVpoChapters title="Doce temas para saber qué preparar" />
        </PublicSection>
      ) : null}

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

      <PublicSection muted>
        <div className="public-card flex flex-col gap-5 p-5 md:flex-row md:items-end md:justify-between md:p-7">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
              También con {proPlan.name}
            </p>
            <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">
              PRO no promete un curso que no exista
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              Si una guía está incluida en PRO, su ficha lo indica. No prometemos un curso cuya ruta no
              esté publicada. Renovación mensual · {proPlan.price}.
            </p>
          </div>
          <ButtonLink href={proPlan.checkoutHref} variant="secondary" size="lg">
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
              Entender el proceso y preparar papeles
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Registro, requisitos, carpeta de documentación y pasos hasta la firma. Antes de apuntarte a una promoción.
            </p>
            <div className="mt-4">
              <ButtonLink href={generalPayHref}>
                {generalOwned
                  ? 'Abrir la guía'
                  : generalSellable
                    ? `Pagar la guía · ${priceLabel}`
                    : 'Ir a la guía general'}
              </ButtonLink>
            </div>
          </article>
          <article className="public-card p-5 md:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--green-700)]">
              Después
            </p>
            <h3 className="mt-2 text-lg font-black text-[var(--ink)]">
              Consultar promociones oficiales
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Cuando ya sepas qué mirar, abre las bases en el visor. Eso es gratis, sin cuenta.
            </p>
            <div className="mt-4">
              <ButtonLink href="/promotions" variant="secondary">
                Ver promociones (gratis)
              </ButtonLink>
            </div>
          </article>
        </div>
      </PublicSection>

      {visibleCourses.length > 0 ? (
        <PublicSection id="catalogo" border>
          <SectionHeader
            eyebrow="Catálogo"
            title="Guías publicadas"
            description="Cada ficha publicada en el backoffice aparece aquí, con su precio y formato reales."
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course) => (
              <CourseProductCard
                key={course.id}
                course={course}
                owned={ownedSlugs.has(course.slug)}
              />
            ))}
          </div>
        </PublicSection>
      ) : null}
    </PublicPage>
  );
}
