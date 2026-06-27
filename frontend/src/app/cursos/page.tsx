import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { CourseProductCard } from '@/components/course-product-card';
import { ButtonLink, SectionHeader } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import { proHref, proIncludes, proPlan } from '@/lib/pro';

export const metadata: Metadata = createMetadata({
  title: 'Cursos VPO — Formación premium para conseguir vivienda protegida',
  description: 'Marketplace de cursos VPO con temario visual, acceso por plan y compra directa. Prepárate antes del plazo.',
  path: '/cursos',
  keywords: ['curso VPO', 'formación vivienda protegida', 'VPO PRO', 'Cataluña'],
});

export default async function CoursesPage() {
  const courses = await api.listCourses().catch(() => []);
  const visibleCourses = [...courses].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  const proCourses = visibleCourses.filter((course) => course.accessType === 'pro');
  const premiumCourses = visibleCourses.filter((course) => course.accessType !== 'pro');

  return (
    <main className="shell space-y-10 pb-16 md:space-y-12">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Cursos', path: '/cursos' },
        ])}
      />

      <section className="marketplace-hero px-5 py-8 md:px-10 md:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cyan-700)]">Marketplace premium</p>
        <h1 className="display-type mt-3 max-w-3xl text-3xl font-black leading-[1.05] text-[var(--ink)] md:text-5xl">
          Cursos para conseguir tu VPO con ventaja
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)] md:text-base md:leading-7">
          Formación visual, progreso claro y acceso inmediato. Compra el curso o desbloquéalo con VPO PRO.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
          <ButtonLink href="/acompanamiento" variant="secondary">Solicitar acompañamiento</ButtonLink>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {proIncludes.slice(0, 4).map((item) => (
          <article key={item.title} className="glass-panel border-[var(--stroke)] bg-white/60 p-4">
            <span className="text-xl" aria-hidden="true">{item.icon}</span>
            <h2 className="mt-2 text-sm font-black text-[var(--ink)]">{item.title}</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">{item.description}</p>
          </article>
        ))}
      </section>

      {visibleCourses.length === 0 ? (
        <EmptyState title="Sin cursos publicados" description="El catálogo aparecerá aquí cuando haya contenido disponible." />
      ) : (
        <>
          {proCourses.length > 0 ? (
            <section id="catalogo" className="space-y-5">
              <SectionHeader
                eyebrow="Incluido en PRO"
                title="Cursos con VPO PRO"
                description="Desbloquea formación completa con tu suscripción."
              />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {proCourses.map((course) => (
                  <CourseProductCard key={course.id} course={course} includedInPro showCta />
                ))}
              </div>
            </section>
          ) : null}

          {premiumCourses.length > 0 ? (
            <section className="space-y-5">
              <SectionHeader
                eyebrow="Compra directa"
                title="Cursos premium"
                description="Acceso individual con pago seguro vía Stripe."
              />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {premiumCourses.map((course) => (
                  <CourseProductCard key={course.id} course={course} showCta />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <section className="conversion-panel px-6 py-10 text-center md:px-10 md:py-12">
        <h2 className="display-type text-2xl font-black text-white md:text-3xl">
          Desbloquea todo el catálogo con VPO PRO
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">{proPlan.price}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href={proHref} className="!bg-white !text-[var(--ink)] hover:!bg-[var(--bg-eco)]">
            {proPlan.ctaLabel}
          </ButtonLink>
          <ButtonLink href="/alerts" variant="secondary" className="!border-white/25 !bg-white/10 !text-white hover:!bg-white/20">
            Ver próximos lanzamientos
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
