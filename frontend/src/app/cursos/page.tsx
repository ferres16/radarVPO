import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { ButtonLink, Eyebrow, SurfaceCard } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import { proHref, proIncludes, proPlan, starterCourseKeywords } from '@/lib/pro';
import type { Course } from '@/types';

export const metadata: Metadata = createMetadata({
  title: 'Curso de iniciación incluido con VPO PRO',
  description: 'Aprende el proceso de vivienda protegida con el curso incluido en VPO PRO.',
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

      <section className="mx-auto max-w-3xl text-center">
        <Eyebrow>VPO PRO</Eyebrow>
        <h1 className="display-type mt-4 text-4xl font-black text-[var(--ink)] md:text-5xl">
          Formación incluida para entender el proceso
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--ink-soft)]">
          {proPlan.name} incluye el {proPlan.courseLabel.toLowerCase()}. Sin improvisar cuando llegue una convocatoria.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
          {starterCourse ? (
            <ButtonLink href={`/cursos/${starterCourse.slug}`} variant="secondary">Ver curso</ButtonLink>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {proIncludes.slice(0, 4).map((item) => (
          <SurfaceCard key={item.title} className="p-5 text-center">
            <span className="text-2xl" aria-hidden="true">{item.icon}</span>
            <h2 className="mt-3 text-sm font-black text-[var(--ink)]">{item.title}</h2>
          </SurfaceCard>
        ))}
      </section>

      {visibleCourses.length === 0 ? (
        <EmptyState title="Sin cursos publicados" description="El catálogo aparecerá aquí cuando haya contenido disponible." />
      ) : (
        <section id="catalogo" className="space-y-4">
          <h2 className="text-xl font-black text-[var(--ink)]">Catálogo</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course) => {
              const includedInPro = course.id === starterCourse?.id || course.accessType === 'pro';
              return (
                <Link
                  key={course.id}
                  href={`/cursos/${course.slug}`}
                  className="group rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card transition hover:-translate-y-1"
                >
                  {course.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.coverImage} alt="" className="mb-4 h-36 w-full rounded-2xl object-cover" />
                  ) : null}
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${includedInPro ? 'bg-[var(--green-700)] text-white' : 'bg-[var(--bg-app)] text-[var(--ink-soft)]'}`}>
                    {includedInPro ? 'Incluido en VPO PRO' : 'Curso'}
                  </span>
                  <h3 className="mt-3 text-lg font-black text-[var(--ink)] group-hover:text-[var(--green-700)]">{course.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--ink-soft)]">{course.shortDescription || 'Ver temario'}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-[2rem] bg-[var(--ink)] px-6 py-10 text-center text-white">
        <h2 className="display-type text-2xl font-black">Accede al curso con VPO PRO</h2>
        <p className="mt-3 text-sm text-white/70">{proPlan.price}</p>
        <div className="mt-6">
          <ButtonLink href={proHref} className="!bg-white !text-[var(--ink)]">{proPlan.ctaLabel}</ButtonLink>
        </div>
      </section>
    </main>
  );
}
