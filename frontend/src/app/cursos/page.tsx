import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { CourseProductCard } from '@/components/course-product-card';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
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

  return (
    <PublicPage>
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
        description="Pago único, sin renovaciones. Ves el programa, el estado real del contenido y el precio final antes de comprar."
        actions={
          <div className="lp-hero__actions lp-hero__actions--stack">
            <ButtonLink href="#catalogo" size="lg" block>
              Ver cursos
            </ButtonLink>
          </div>
        }
      />

      {visibleCourses.length === 0 ? (
        <PublicSection>
          <EmptyState title="Sin cursos publicados" description="El catálogo aparecerá aquí cuando haya contenido disponible." />
        </PublicSection>
      ) : (
        <PublicSection id="catalogo">
          <SectionHeader
            eyebrow="Catálogo"
            title="Cursos"
            description="Los cursos en preparación muestran su programa pero todavía no se pueden comprar."
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {visibleCourses.map((course) => (
              <CourseProductCard key={course.id} course={course} />
            ))}
          </div>
        </PublicSection>
      )}
    </PublicPage>
  );
}
