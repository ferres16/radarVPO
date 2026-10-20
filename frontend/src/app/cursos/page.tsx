import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { CourseProductCard } from '@/components/course-product-card';
import { PageViewTracker } from '@/components/conversion/page-view-tracker';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import { formatEuro, getCoursePrice, isCourseSellable, isIncludedInPro } from '@/lib/offer';
import { proPlan } from '@/lib/pro';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Guías Radar VPO',
  description:
    'Guías claras sobre vivienda protegida en Cataluña. Pago único, contenido al grano y acceso inmediato. Elige la que necesitas ahora.',
  path: '/cursos',
  keywords: ['guía VPO', 'vivienda protegida Cataluña', 'formación VPO', 'Radar VPO'],
});

export default async function CoursesPage() {
  const courses = await api.listCourses().catch(() => []);
  const visibleCourses = [...courses].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  const featured =
    visibleCourses.find((course) => course.slug === 'vpo-inicial') ??
    visibleCourses.find(isCourseSellable) ??
    visibleCourses[0];
  const featuredSellable = featured ? isCourseSellable(featured) : false;
  const featuredPrice = featured ? getCoursePrice(featured) : null;

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
        title="Información que decide"
        titleAccent="cuando importa"
        description="Menos ruido, más criterio. Guías concretas sobre vivienda protegida en Cataluña: pagas una vez y entras al contenido al momento. PRO incluye el pack inicial mientras la suscripción esté activa."
        actions={
          featured ? (
            <div className="lp-hero__actions lp-hero__actions--stack">
              <ButtonLink href={`/cursos/${featured.slug}`} size="lg" block>
                {featuredSellable
                  ? `Empezar con ${featured.title}${featuredPrice !== null ? ` · ${formatEuro(featuredPrice)}` : ''}`
                  : `Ver ${featured.title}`}
              </ButtonLink>
            </div>
          ) : undefined
        }
      />

      <PublicSection>
        <div className="lp-why-grid">
          <article className="lp-why-card">
            <h2 className="lp-why-card__title">Criterio, no relleno</h2>
            <p className="lp-why-card__text">
              Cada guía va al grano: qué mirar, qué priorizar y qué errores evitar. Sin humo.
            </p>
          </article>
          <article className="lp-why-card">
            <h2 className="lp-why-card__title">Pago único</h2>
            <p className="lp-why-card__text">
              Compras, lees y conservas el acceso mientras el contenido siga publicado. Sin renovaciones ocultas.
            </p>
          </article>
          <article className="lp-why-card">
            <h2 className="lp-why-card__title">Incluido en PRO</h2>
            <p className="lp-why-card__text">
              El pack inicial entra con {proPlan.name} ({proPlan.price}) mientras la suscripción esté activa.
              Lo avanzado, si está a la venta, se compra aparte.
            </p>
          </article>
        </div>
      </PublicSection>

      {visibleCourses.length === 0 ? (
        <PublicSection>
          <EmptyState
            title="Sin guías publicadas"
            description="El catálogo aparecerá aquí cuando haya contenido disponible."
          />
        </PublicSection>
      ) : (
        <PublicSection id="catalogo">
          <SectionHeader
            eyebrow="Catálogo"
            title="Elige la guía que te falta ahora"
            description="Precio final visible. Acceso inmediato. Sin suscripciones forzadas."
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {visibleCourses.map((course) => (
              <div key={course.id} className="space-y-2">
                <CourseProductCard course={course} />
                {isIncludedInPro(course) ? (
                  <p className="px-1 text-xs font-semibold text-[var(--green-700)]">
                    Incluido en PRO mientras esté activa
                  </p>
                ) : (
                  <p className="px-1 text-xs text-[var(--ink-soft)]">Compra aparte · no incluido en PRO</p>
                )}
              </div>
            ))}
          </div>
        </PublicSection>
      )}
    </PublicPage>
  );
}
