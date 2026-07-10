import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { CourseProductCard } from '@/components/course-product-card';
import { PublicCtaBand, PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader } from '@/components/design-system';
import { HorizontalRail, HorizontalRailItem } from '@/components/saas/horizontal-rail';
import { TrustMetrics } from '@/components/saas/trust-metrics';
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
        title="Formación profesional"
        titleAccent="para conseguir tu vivienda"
        description="No es una tienda de PDFs. Es una academia práctica para entender requisitos, documentación y estrategia antes del plazo."
        actions={
          <div className="lp-hero__actions lp-hero__actions--stack">
            <ButtonLink href={proHref} size="lg" block>
              {proPlan.ctaLabel}
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
            <strong>PRO</strong> incluye Guía VPO
          </span>
        </div>
        <div className="mt-4">
          <TrustMetrics />
        </div>
      </PublicSection>

      {visibleCourses.length === 0 ? (
        <PublicSection>
          <EmptyState title="Sin cursos publicados" description="El catálogo aparecerá aquí cuando haya contenido disponible." />
        </PublicSection>
      ) : (
        <>
          {proCourses.length > 0 ? (
            <PublicSection id="catalogo">
              <SectionHeader
                eyebrow="Incluido en PRO"
                title="Curso Guía VPO con VPO PRO"
                description="Desbloqueado con tu suscripción PRO junto a los avisos por email y SMS."
              />
              <div className="mt-4 md:hidden">
                <HorizontalRail>
                  {proCourses.map((course) => (
                    <HorizontalRailItem key={course.id}>
                      <CourseProductCard course={course} includedInPro showCta layout="rail" />
                    </HorizontalRailItem>
                  ))}
                </HorizontalRail>
              </div>
              <div className="mt-4 hidden gap-4 md:grid md:grid-cols-2 md:gap-5 xl:grid-cols-3">
                {proCourses.map((course) => (
                  <CourseProductCard key={course.id} course={course} includedInPro showCta />
                ))}
              </div>
            </PublicSection>
          ) : null}

          {premiumCourses.length > 0 ? (
            <PublicSection muted={proCourses.length > 0}>
              <SectionHeader eyebrow="Compra directa" title="Programas premium" description="Acceso individual con pago seguro." />
              <div className="mt-4 md:hidden">
                <HorizontalRail>
                  {premiumCourses.map((course) => (
                    <HorizontalRailItem key={course.id}>
                      <CourseProductCard course={course} showCta layout="rail" />
                    </HorizontalRailItem>
                  ))}
                </HorizontalRail>
              </div>
              <div className="mt-4 hidden gap-4 md:grid md:grid-cols-2 md:gap-5 xl:grid-cols-3">
                {premiumCourses.map((course) => (
                  <CourseProductCard key={course.id} course={course} showCta />
                ))}
              </div>
            </PublicSection>
          ) : null}
        </>
      )}

      <PublicCtaBand title="Activa VPO PRO: avisos y Guía VPO" description={`${proPlan.price} · avisos por email y SMS, y curso Guía VPO incluido`}>
        <ButtonLink href={proHref} size="lg" block>
          {proPlan.ctaLabel}
        </ButtonLink>
        <ButtonLink href="/alerts" variant="secondary" size="lg" block>
          Ver próximos lanzamientos
        </ButtonLink>
      </PublicCtaBand>
    </PublicPage>
  );
}
