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
  title: 'Guías para preparar tu solicitud de vivienda protegida',
  description:
    'Guías PDF y formación de pago único para entender y preparar tu solicitud de vivienda protegida en Cataluña. Contenido y precio final visibles antes de comprar.',
  path: '/cursos',
  keywords: ['guía VPO', 'curso VPO', 'formación vivienda protegida', 'Cataluña'],
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
        title="Prepara tu solicitud"
        titleAccent="con una guía clara"
        description="Pago único, sin renovaciones. Puedes empezar con una guía PDF (solo visualización, sin descarga) o con un programa por lecciones. PRO incluye el contenido inicial mientras la suscripción esté activa."
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
            <h2 className="lp-why-card__title">Compra única</h2>
            <p className="lp-why-card__text">
              Pagas una vez. Conservas el acceso si cancelas PRO, mientras el contenido siga publicado.
            </p>
          </article>
          <article className="lp-why-card">
            <h2 className="lp-why-card__title">Incluido en PRO</h2>
            <p className="lp-why-card__text">
              El contenido inicial entra con {proPlan.name} ({proPlan.price}) solo mientras la suscripción esté
              activa. El avanzado, si está a la venta, se compra aparte.
            </p>
          </article>
          <article className="lp-why-card">
            <h2 className="lp-why-card__title">Guía PDF o lecciones</h2>
            <p className="lp-why-card__text">
              Las guías PDF se consultan en pantalla (sin descarga). Los programas por lecciones se muestran
              cuando hay contenido publicado.
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
            title="Guías"
            description="Cada ficha indica si está a la venta, si lo incluye PRO y si es una guía PDF o un programa por lecciones."
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
