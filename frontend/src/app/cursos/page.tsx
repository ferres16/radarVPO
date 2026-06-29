import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { CourseProductCard } from '@/components/course-product-card';
import { PublicCtaBand, PublicPage, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader } from '@/components/design-system';
import { Stagger, StaggerItem } from '@/components/motion-primitives';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import { proHref, proPlan } from '@/lib/pro';

export const metadata: Metadata = createMetadata({
  title: 'Cursos VPO — Formación para conseguir vivienda protegida',
  description: 'Cursos VPO con temario claro, acceso por plan y compra directa. Prepárate antes del plazo.',
  path: '/cursos',
  keywords: ['curso VPO', 'formación vivienda protegida', 'VPO PRO', 'Cataluña'],
});

export default async function CoursesPage() {
  const courses = await api.listCourses().catch(() => []);
  const visibleCourses = [...courses].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  const proCourses = visibleCourses.filter((course) => course.accessType === 'pro');
  const premiumCourses = visibleCourses.filter((course) => course.accessType !== 'pro');

  return (
    <PublicPage>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Cursos', path: '/cursos' },
        ])}
      />

      <section className="lp-page-hero">
        <div className="lp-page-hero__backdrop" aria-hidden="true" />
        <div className="shell lp-page-hero__inner">
          <span className="lp-hero__badge">Formación VPO</span>
          <h1 className="lp-page-hero__title">
            Cursos para llegar preparado
            <span className="lp-hero__title-accent"> al plazo</span>
          </h1>
          <p className="lp-page-hero__subtitle">
            Formación clara y acceso inmediato. Compra el curso o desbloquéalo con VPO PRO.
          </p>
          <div className="lp-hero__actions">
            <ButtonLink href={proHref} size="lg">{proPlan.ctaLabel}</ButtonLink>
            <ButtonLink href="/acompanamiento" variant="secondary" size="lg">Solicitar acompañamiento</ButtonLink>
          </div>
        </div>
      </section>

      {visibleCourses.length === 0 ? (
        <PublicSection>
          <EmptyState title="Sin cursos publicados" description="El catálogo aparecerá aquí cuando haya contenido disponible." />
        </PublicSection>
      ) : (
        <>
          {proCourses.length > 0 ? (
            <PublicSection id="catalogo">
              <SectionHeader eyebrow="Incluido en PRO" title="Cursos con VPO PRO" description="Desbloquea formación completa con tu suscripción." />
              <Stagger className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {proCourses.map((course) => (
                  <StaggerItem key={course.id}>
                    <CourseProductCard course={course} includedInPro showCta />
                  </StaggerItem>
                ))}
              </Stagger>
            </PublicSection>
          ) : null}

          {premiumCourses.length > 0 ? (
            <PublicSection muted={proCourses.length > 0}>
              <SectionHeader eyebrow="Compra directa" title="Cursos premium" description="Acceso individual con pago seguro vía Stripe." />
              <Stagger className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {premiumCourses.map((course) => (
                  <StaggerItem key={course.id}>
                    <CourseProductCard course={course} showCta />
                  </StaggerItem>
                ))}
              </Stagger>
            </PublicSection>
          ) : null}
        </>
      )}

      <PublicCtaBand title="Desbloquea todo el catálogo con VPO PRO" description={proPlan.price}>
        <ButtonLink href={proHref} size="lg">{proPlan.ctaLabel}</ButtonLink>
        <ButtonLink href="/alerts" variant="secondary" size="lg">Ver próximos lanzamientos</ButtonLink>
      </PublicCtaBand>
    </PublicPage>
  );
}
