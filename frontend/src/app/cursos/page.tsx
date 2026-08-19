import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { CourseProductCard } from '@/components/course-product-card';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Cursos VPO — Formación para conseguir vivienda protegida',
  description: 'Cursos VPO con temario claro, acceso por plan y compra directa. Prepárate antes del plazo.',
  path: '/cursos',
  keywords: ['curso VPO', 'formación vivienda protegida', 'Cataluña'],
});

export default async function CoursesPage() {
  const courses = await api.listCourses().catch(() => []);
  const visibleCourses = [...courses].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  const totalLessons = visibleCourses.reduce(
    (acc, course) => acc + (course.modules?.reduce((m, mod) => m + (mod.lessons?.length || 0), 0) || 0),
    0,
  );

  return (
    <PublicPage>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Cursos', path: '/cursos' },
        ])}
      />

      <PublicPageHero
        badge="Academia VPO"
        title="Formación práctica"
        titleAccent="para conseguir tu vivienda"
        description="Temario claro para entender requisitos, documentación y estrategia antes del plazo."
        actions={
          <div className="lp-hero__actions lp-hero__actions--stack">
            <ButtonLink href="#catalogo" size="lg" block>
              Ver cursos
            </ButtonLink>
            <ButtonLink href="/acompanamiento" variant="secondary" size="lg" block>
              Solicitar acompañamiento
            </ButtonLink>
          </div>
        }
      />

      <PublicSection muted>
        <div className="academy-hero-stats">
          <span className="academy-stat">
            <strong>{visibleCourses.length}</strong> programas
          </span>
          <span className="academy-stat">
            <strong>{totalLessons || '—'}</strong> lecciones
          </span>
          <span className="academy-stat">
            <strong>Guía VPO</strong> incluida en PRO
          </span>
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
            title="Todos los cursos"
            description="Incluidos en PRO y de compra directa, con acceso y precio en cada ficha."
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {visibleCourses.map((course) => (
              <CourseProductCard
                key={course.id}
                course={course}
                includedInPro={course.accessType === 'pro'}
                showCta
              />
            ))}
          </div>
        </PublicSection>
      )}
    </PublicPage>
  );
}
