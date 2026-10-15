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
  title: 'Cursos para preparar tu solicitud de vivienda protegida',
  description:
    'Cursos de pago único para entender y preparar tu solicitud de vivienda protegida en Cataluña. Programa, precio final y estado del contenido visibles antes de comprar.',
  path: '/cursos',
  keywords: ['curso VPO', 'formación vivienda protegida', 'Cataluña'],
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
          { name: 'Cursos', path: '/cursos' },
        ])}
      />

      <PublicPageHero
        badge="Cursos"
        title="Aprende a preparar"
        titleAccent="tu solicitud de vivienda protegida"
        description="Pago único, sin renovaciones. Ves el programa, el estado real del contenido y el precio final antes de comprar. PRO incluye el curso inicial solo mientras la suscripción esté activa."
        actions={
          featured ? (
            <div className="lp-hero__actions lp-hero__actions--stack">
              <ButtonLink href={`/cursos/${featured.slug}`} size="lg" block>
                {featuredSellable
                  ? `Ver ${featured.title}${featuredPrice !== null ? ` · ${formatEuro(featuredPrice)}` : ''}`
                  : `Ver el programa de ${featured.title}`}
              </ButtonLink>
            </div>
          ) : undefined
        }
      />

      <PublicSection>
        <div className="lp-why-grid">
          <article className="lp-why-card">
            <h2 className="lp-why-card__title">Comprar el curso</h2>
            <p className="lp-why-card__text">
              Pago único. Conservas el acceso si cancelas PRO, mientras el curso siga publicado.
            </p>
          </article>
          <article className="lp-why-card">
            <h2 className="lp-why-card__title">Incluido en PRO</h2>
            <p className="lp-why-card__text">
              El inicial entra con {proPlan.name} ({proPlan.price}) solo mientras la suscripción esté activa. El
              avanzado, si está a la venta, se compra aparte.
            </p>
          </article>
          <article className="lp-why-card">
            <h2 className="lp-why-card__title">En preparación</h2>
            <p className="lp-why-card__text">
              Si un curso tiene pocas lecciones publicadas, se muestra el programa y no se puede comprar todavía.
            </p>
          </article>
        </div>
      </PublicSection>

      {visibleCourses.length === 0 ? (
        <PublicSection>
          <EmptyState title="Sin cursos publicados" description="El catálogo aparecerá aquí cuando haya contenido disponible." />
        </PublicSection>
      ) : (
        <PublicSection id="catalogo">
          <SectionHeader
            eyebrow="Catálogo"
            title="Cursos"
            description="Cada ficha indica si está a la venta, si lo incluye PRO y cuántas lecciones hay publicadas."
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
