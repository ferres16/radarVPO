import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { GuideVpoChapters } from '@/components/conversion/guide-vpo-outline';
import { PageViewTracker } from '@/components/conversion/page-view-tracker';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { CourseProductCard } from '@/components/course-product-card';
import { ButtonLink, SectionHeader } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import {
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
  title: 'Guías de vivienda protegida',
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
  const priceLabel =
    generalPrice !== null ? formatEuro(generalPrice) : 'Precio en la ficha';

  return (
    <PublicPage>
      <PageViewTracker event="course_page_viewed" />
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Guías', path: '/cursos' },
        ])}
      />

      <PublicPageHero
        animated={false}
        badge="Guía VPO"
        title={GUIDE_VPO_TITLE}
        description={`${GUIDE_VPO_TAGLINE} ${GUIDE_VPO_SHORT}`}
        actions={
          <div className="lp-hero__actions lp-hero__actions--stack">
            <ButtonLink href={detailHref} size="lg" block>
              {generalOwned
                ? 'Abrir la guía'
                : generalSellable
                  ? `Ver ficha y muestra · ${priceLabel}`
                  : 'Ver ficha de la guía'}
            </ButtonLink>
            <ButtonLink href="/promotions" variant="secondary" size="lg" block>
              Ver promociones gratis
            </ButtonLink>
          </div>
        }
      />

      <PublicSection>
        <SectionHeader
          eyebrow="Una sola guía"
          title="La ficha canónica está en Guía VPO"
          description={GUIDE_VPO_VALUE}
        />
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
          El pago y la muestra viven en la ficha del producto. Esta página es solo la entrada al catálogo
          para no duplicar el recorrido de compra.
        </p>
        <div className="mt-6">
          <ButtonLink href={detailHref} size="lg">
            Ir a la ficha de la guía →
          </ButtonLink>
        </div>
      </PublicSection>

      {isGuideVpoSlug(generalGuide?.slug) && !generalOwned ? (
        <PublicSection muted>
          <GuideVpoChapters title="Temas que cubre la guía" />
        </PublicSection>
      ) : null}

      {visibleCourses.length > 0 ? (
        <PublicSection id="catalogo" border>
          <SectionHeader
            eyebrow="Catálogo"
            title="Guías publicadas"
            description="Cada guía publicada aparece aquí con su precio, formato y acceso reales."
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
