import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { GuideVpoChapters } from '@/components/conversion/guide-vpo-outline';
import { PageViewTracker } from '@/components/conversion/page-view-tracker';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { CourseProductCard } from '@/components/course-product-card';
import { ButtonLink } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import {
  COURSE_ACCESS_MIN_MONTHS,
  formatEuro,
  getCoursePrice,
  isCourseSellable,
  isGuidePdf,
} from '@/lib/offer';
import {
  GUIDE_VPO_SEO_DESCRIPTION,
  GUIDE_VPO_SHORT,
  GUIDE_VPO_TAGLINE,
  GUIDE_VPO_TITLE,
  GUIDE_VPO_VALUE,
  isGuideVpoSlug,
} from '@/lib/guide-vpo';
import { getGuideReadHref, getOwnedCourseSlugs } from '@/lib/owned-courses';
import { publicCatalogCourses } from '@/lib/public-courses';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import type { Course } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Guía de vivienda protegida',
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

const GUIDE_BENEFITS = [
  {
    title: 'Por dónde empezar',
    text: 'Ordena el proceso: registro, requisitos y papeles antes de mirar promociones al azar.',
  },
  {
    title: 'Cuentas y documentación',
    text: 'Qué datos mirar, qué reunir y cómo interpretar precios, gastos y tipos de promoción.',
  },
  {
    title: 'Después de que te seleccionen',
    text: 'Reserva, arras y pasos hasta la firma, explicados con calma y sin jerga innecesaria.',
  },
] as const;

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
  const detailHref = generalGuide
    ? generalOwned
      ? getGuideReadHref(generalGuide.slug)
      : `/cursos/${generalGuide.slug}`
    : '/cursos/guiav1';
  const payHref = generalGuide && !generalOwned ? `/cursos/${generalGuide.slug}#pagar` : detailHref;
  const sampleHref = generalOwned ? detailHref : `${detailHref}#muestra`;
  const priceLabel =
    generalPrice !== null ? formatEuro(generalPrice) : null;

  return (
    <PublicPage>
      <PageViewTracker event="course_page_viewed" properties={{ page: 'catalog' }} />
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Guía', path: '/cursos' },
        ])}
      />

      <PublicPageHero
        animated={false}
        badge="Pago único · lectura en pantalla"
        title={GUIDE_VPO_TITLE}
        description={`${GUIDE_VPO_TAGLINE} ${GUIDE_VPO_SHORT}`}
        actions={
          <div className="lp-hero__actions lp-hero__actions--stack">
            <ButtonLink href={generalOwned ? detailHref : payHref} size="lg" block>
              {generalOwned
                ? 'Abrir mi guía'
                : priceLabel
                  ? `Ver precio y comprar · ${priceLabel}`
                  : 'Ver ficha y comprar'}
            </ButtonLink>
            {!generalOwned ? (
              <ButtonLink href={sampleHref} variant="secondary" size="lg" block>
                Ver una muestra gratis
              </ButtonLink>
            ) : (
              <ButtonLink href="/promotions" variant="secondary" size="lg" block>
                Ver promociones
              </ButtonLink>
            )}
          </div>
        }
        footer={
          <ul className="lp-hero__proof" aria-label="Datos de la guía">
            <li>
              <span className="lp-hero__proof-mark" aria-hidden>
                ✓
              </span>
              Pago único{priceLabel ? ` · ${priceLabel}` : ''}
            </li>
            <li>
              <span className="lp-hero__proof-mark" aria-hidden>
                ✓
              </span>
              Acceso mínimo {COURSE_ACCESS_MIN_MONTHS} meses
            </li>
            <li>
              <span className="lp-hero__proof-mark" aria-hidden>
                ✓
              </span>
              Sin suscripción ni descargas
            </li>
          </ul>
        }
      />

      <PublicSection>
        <div className="lp-section__head">
          <p className="lp-eyebrow">Para quién</p>
          <h2 className="lp-title">Si quieres entender el proceso antes de solicitar</h2>
          <p className="lp-lead">{GUIDE_VPO_VALUE}</p>
        </div>
        <div className="lp-why-grid">
          {GUIDE_BENEFITS.map((item) => (
            <article key={item.title} className="lp-why-card">
              <h3 className="lp-why-card__title">{item.title}</h3>
              <p className="lp-why-card__text">{item.text}</p>
            </article>
          ))}
        </div>
      </PublicSection>

      {isGuideVpoSlug(generalGuide?.slug) && !generalOwned ? (
        <PublicSection muted>
          <GuideVpoChapters title="Qué cubre la guía" />
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={sampleHref} size="lg">
              Ver muestra
            </ButtonLink>
            <ButtonLink href={payHref} variant="secondary" size="lg">
              {priceLabel ? `Ir a pagar · ${priceLabel}` : 'Ir a la ficha'}
            </ButtonLink>
          </div>
        </PublicSection>
      ) : null}

      <PublicSection border>
        <div className="public-cta-band">
          <div>
            <h2 className="lp-title lp-title--sm">
              {generalOwned ? 'Ya tienes acceso a la guía' : 'Una sola guía, clara y completa'}
            </h2>
            <p className="lp-lead">
              {generalOwned
                ? 'Entra cuando quieras desde tu cuenta. El acceso se conserva el tiempo contratado.'
                : `Lectura en pantalla dentro de Radar VPO. ${
                    priceLabel
                      ? `Precio final ${priceLabel}, pago único.`
                      : 'El precio aparece en la ficha antes de pagar.'
                  }`}
            </p>
          </div>
          <div className="public-cta-band__actions">
            <ButtonLink href={generalOwned ? detailHref : payHref} size="lg" block>
              {generalOwned
                ? 'Abrir la guía'
                : priceLabel
                  ? `Comprar la guía · ${priceLabel}`
                  : 'Ver ficha de la guía'}
            </ButtonLink>
            <Link href="/pro" className="text-center text-sm font-semibold text-[var(--green-700)]">
              ¿Prefieres avisos? Ver Radar VPO PRO
            </Link>
          </div>
        </div>
      </PublicSection>

      {visibleCourses.length > 1 ? (
        <PublicSection id="catalogo" muted>
          <div className="lp-section__head">
            <p className="lp-eyebrow">Otras fichas</p>
            <h2 className="lp-title">Más contenidos publicados</h2>
            <p className="lp-lead">
              Hoy la oferta principal es una guía. Si hay más fichas publicadas, aparecen aquí.
            </p>
          </div>
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
