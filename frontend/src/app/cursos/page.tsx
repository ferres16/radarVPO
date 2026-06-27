import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { ButtonLink, PageHero, SectionHeader } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import { proHref, proIncludes, proPlan, starterCourseKeywords } from '@/lib/pro';
import type { Course } from '@/types';

export const metadata: Metadata = createMetadata({
  title: 'Cursos de vivienda protegida incluidos con VPO PRO',
  description: 'Formación premium para entender el proceso de vivienda protegida con el curso incluido en VPO PRO.',
  path: '/cursos',
  keywords: ['curso VPO', 'VPO PRO', 'vivienda protegida Cataluña'],
});

const getCourseSalePrice = (course: Course) => {
  const metadataSalePrice = course.seoMetadata?.salePrice;
  if (typeof metadataSalePrice === 'string' || typeof metadataSalePrice === 'number') {
    return metadataSalePrice;
  }
  return course.salePrice;
};

export default async function CoursesPage() {
  const courses = await api.listCourses().catch(() => []);
  const visibleCourses = [...courses].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  const starterCourse =
    visibleCourses.find((course) => course.accessType === 'pro') ||
    visibleCourses.find((course) =>
      starterCourseKeywords.some((keyword) =>
        `${course.title} ${course.shortDescription || ''}`.toLowerCase().includes(keyword),
      ),
    ) ||
    visibleCourses[0];

  return (
    <main className="shell space-y-12 pb-16">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Cursos', path: '/cursos' },
        ])}
      />

      <PageHero
        eyebrow="Formación premium"
        title="Aprende el proceso sin improvisar"
        description={`${proPlan.name} incluye el ${proPlan.courseLabel.toLowerCase()}. Contenido claro, visual y pensado para cuando llegue la convocatoria.`}
        actions={
          <>
            <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
            {starterCourse ? (
              <ButtonLink href={`/cursos/${starterCourse.slug}`} variant="secondary">Ver curso</ButtonLink>
            ) : null}
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {proIncludes.slice(0, 4).map((item) => (
          <article key={item.title} className="border-l-2 border-[var(--green-700)] pl-4">
            <span className="text-xl" aria-hidden="true">{item.icon}</span>
            <h2 className="mt-2 text-sm font-black text-[var(--ink)]">{item.title}</h2>
          </article>
        ))}
      </section>

      {visibleCourses.length === 0 ? (
        <EmptyState title="Sin cursos publicados" description="El catálogo aparecerá aquí cuando haya contenido disponible." />
      ) : (
        <section id="catalogo" className="space-y-6">
          <SectionHeader title="Catálogo de formación" description="Cursos con portadas, temario y acceso según tu plan." />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course) => {
              const includedInPro = course.id === starterCourse?.id || course.accessType === 'pro';
              const lessonCount = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
              const salePrice = getCourseSalePrice(course);

              return (
                <Link
                  key={course.id}
                  href={`/cursos/${course.slug}`}
                  className="premium-card group block overflow-hidden"
                >
                  <div className="relative">
                    {course.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.coverImage} alt="" className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-[var(--bg-eco)] to-[var(--bg-muted)] text-sm font-semibold text-[var(--ink-soft)]">
                        Sin portada
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,18,32,0.55)] via-transparent to-transparent" />
                    <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${includedInPro ? 'bg-[var(--green-700)] text-white shadow-glow' : 'bg-white/90 text-[var(--ink)]'}`}>
                      {includedInPro ? 'Incluido en VPO PRO' : 'Curso'}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-black text-[var(--ink)] group-hover:text-[var(--green-700)]">{course.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--ink-soft)]">{course.shortDescription || 'Ver temario completo'}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--ink-soft)]">
                      {lessonCount > 0 ? <span className="rounded-full bg-[var(--bg-app)] px-2.5 py-1">{lessonCount} lecciones</span> : null}
                      {salePrice ? <span className="rounded-full bg-[var(--bg-app)] px-2.5 py-1">Desde {salePrice} €</span> : null}
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                      <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[var(--green-700)] to-[var(--cyan-500)]" />
                    </div>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--green-700)]">Explorar curso →</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="section-band section-band--alt px-6 py-10 text-center md:px-10">
        <h2 className="display-type text-2xl font-black text-white md:text-3xl">Accede a toda la formación con VPO PRO</h2>
        <p className="mt-3 text-sm text-white/70">{proPlan.price}</p>
        <div className="mt-6">
          <ButtonLink href={proHref} className="!bg-white !text-[var(--ink)] hover:!bg-[var(--bg-eco)]">{proPlan.ctaLabel}</ButtonLink>
        </div>
      </section>
    </main>
  );
}
