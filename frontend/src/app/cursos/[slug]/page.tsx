import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { CourseAccessLink, CourseAccessProvider, CourseLessonAccessLink } from '@/components/course-access';
import { CourseCoverImage } from '@/components/course-cover-image';
import { StructuredData } from '@/components/structured-data';
import { buildCourseAccessTargets } from '@/lib/course-access-targets';
import { absoluteUrl, breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import { proHref, proPlan } from '@/lib/pro';
import type { Course } from '@/types';

const isOnSale = (salePrice?: string | number | null) => {
  if (!salePrice) return false;
  return Number(salePrice) > 0;
};

const getCourseSalePrice = (course: Course) => {
  const metadataSalePrice = course.seoMetadata?.salePrice;
  if (typeof metadataSalePrice === 'string' || typeof metadataSalePrice === 'number') {
    return metadataSalePrice;
  }
  return course.salePrice;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:3000/api/v1';

type CourseDetailParams = {
  params: Promise<{ slug: string }>;
};

async function getPublicCourse(slug: string) {
  return api.getCourse(slug).catch(() => null);
}

async function getCourseWithAccess(slug: string) {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return null;

  const response = await fetch(`${API_BASE_URL}/courses/${slug}/access`, {
    headers: {
      Cookie: cookieHeader,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (response.ok) {
    return response.json() as Promise<Course>;
  }

  if (response.status === 401) {
    return null;
  }

  return null;
}

export async function generateMetadata({ params }: CourseDetailParams): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublicCourse(slug);

  if (!course) {
    return createMetadata({
      title: 'Curso no disponible',
      description: 'Curso de Radar VPO no disponible.',
      path: `/cursos/${slug}`,
    });
  }

  return createMetadata({
    title: course.seoTitle || course.title,
    description:
      course.seoDescription ||
      course.shortDescription ||
      course.longDescription ||
      'Curso práctico de vivienda protegida en Cataluña.',
    path: `/cursos/${course.slug}`,
    keywords: ['curso vivienda protegida', course.title, course.accessType],
  });
}

export default async function CourseDetailPage({ params }: CourseDetailParams) {
  const { slug } = await params;
  const [publicCourse, courseWithAccess] = await Promise.all([
    getPublicCourse(slug),
    getCourseWithAccess(slug),
  ]);
  const course = courseWithAccess || publicCourse;

  if (!course) {
    return notFound();
  }

  const modules = course.modules || [];
  const lessonCount = modules.reduce((count, module) => count + (module.lessons?.length || 0), 0);
  const canAccess = Boolean(course.access?.canAccess);
  const includedInPro = course.accessType === 'pro';
  const { accessHref: courseEntryHref, lockedHref: lockedAccessHref, lockedLabel: lockedAccessLabel, hasLessons } =
    buildCourseAccessTargets(course);
  const salePrice = getCourseSalePrice(course);
  const onSale = isOnSale(salePrice);
  const displayedPrice = onSale ? salePrice : course.price;
  const priceLabel = displayedPrice
    ? new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: course.currency || 'EUR',
        maximumFractionDigits: 0,
      }).format(Number(displayedPrice))
    : course.pricingType === 'free'
      ? 'Gratis'
      : includedInPro
        ? `Incluido en ${proPlan.name}`
        : 'Consultar precio';
  const originalPriceLabel = onSale && course.price
    ? new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: course.currency || 'EUR',
        maximumFractionDigits: 0,
      }).format(Number(course.price))
    : null;

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDescription || course.longDescription || 'Curso practico de vivienda protegida.',
    url: absoluteUrl(`/cursos/${course.slug}`),
    provider: {
      '@type': 'Organization',
      name: 'Radar VPO',
    },
    offers: course.price
      ? {
          '@type': 'Offer',
          price: String(displayedPrice),
          priceCurrency: course.currency || 'EUR',
          availability: 'https://schema.org/InStock',
        }
      : undefined,
  };

  return (
    <main className="shell space-y-6 pb-16">
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Cursos', path: '/cursos' },
            { name: course.title, path: `/cursos/${course.slug}` },
          ]),
          courseJsonLd,
        ]}
      />
      <CourseAccessProvider
        slug={course.slug}
        accessType={course.accessType}
        pricingType={course.pricingType}
        initialCanAccess={canAccess}
      >
        <header className="marketplace-hero overflow-hidden">
          <div className="relative h-48 md:h-64">
            <CourseCoverImage
              src={course.coverImage}
              alt={course.title}
              className="h-full w-full object-cover"
              label={course.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,18,32,0.85)] via-[rgba(11,18,32,0.35)] to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Curso Radar VPO</p>
              <h1 className="display-type mt-2 text-3xl font-black text-white md:text-5xl">{course.title}</h1>
            </div>
          </div>
          <div className="grid gap-6 p-5 md:grid-cols-[1.2fr_0.8fr] md:p-8">
            <div>
              <p className="text-sm leading-7 text-[var(--ink-soft)] md:text-base">
                {course.longDescription || course.shortDescription || 'Formación práctica para prepararte antes del plazo.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                <span className="rounded-full bg-[var(--bg-app)] px-3 py-1">{lessonCount} lecciones</span>
                <span className="rounded-full bg-[var(--bg-app)] px-3 py-1">
                  {includedInPro ? 'Incluido en PRO' : course.accessType}
                </span>
                {canAccess ? (
                  <span className="rounded-full bg-[rgba(22,112,85,0.12)] px-3 py-1 text-[var(--green-700)]">Acceso activo</span>
                ) : (
                  <span className="rounded-full bg-[rgba(232,184,74,0.16)] px-3 py-1 text-[#7a5600]">Bloqueado</span>
                )}
              </div>
            </div>
            <aside className="conversion-panel flex flex-col justify-between p-5 md:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">Precio</p>
                <p className="display-type mt-2 text-3xl font-black text-white">
                  {originalPriceLabel ? (
                    <span className="mr-2 text-base text-white/50 line-through">{originalPriceLabel}</span>
                  ) : null}
                  {priceLabel}
                </p>
                {onSale ? <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">Oferta activa</p> : null}
              </div>
              <div className="mt-6 space-y-2">
                <CourseAccessLink
                  hrefWhenAccess={courseEntryHref}
                  hrefWhenLocked={lockedAccessHref}
                  lockedLabel={lockedAccessLabel}
                  accessLabel={hasLessons ? 'Empezar curso' : 'Ver índice'}
                  className="flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]"
                />
                {!canAccess && includedInPro ? (
                  <ButtonLink href={proHref} variant="secondary" className="w-full !border-white/20 !bg-white/10 !text-white">
                    {proPlan.ctaLabel}
                  </ButtonLink>
                ) : null}
              </div>
            </aside>
          </div>
        </header>

        <section id="indice" className="grid gap-4 scroll-mt-28 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="premium-card p-6">
            <h2 className="text-lg font-black text-[var(--ink)]">Índice del curso</h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              {lessonCount > 0
                ? 'Módulos y lecciones listos para empezar.'
                : 'El contenido se publicará próximamente. Mientras tanto, revisa los beneficios y activa tu acceso.'}
            </p>
            <div className="mt-4 space-y-3">
              {modules.map((module, index) => (
                <details key={module.id} className="group rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)]/60 p-4" open={index === 0}>
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                        Módulo {String(index + 1).padStart(2, '0')}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-[var(--ink)]">{module.title}</h3>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                      {module.lessons?.length || 0}
                    </span>
                  </summary>
                  <div className="mt-3 space-y-2">
                    {(module.lessons || []).map((lesson) => (
                      <CourseLessonAccessLink
                        key={lesson.id}
                        courseSlug={course.slug}
                        lessonSlug={lesson.slug}
                        className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-white/80 px-3 py-2.5 text-sm transition hover:border-[rgba(22,112,85,0.22)] hover:shadow-sm"
                      >
                        <span className="font-semibold text-[var(--ink)]">{lesson.title}</span>
                        <span className="text-xs text-[var(--ink-soft)]">
                          {lesson.durationMinutes ? `${lesson.durationMinutes} min` : 'Lección'}
                        </span>
                      </CourseLessonAccessLink>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </article>

          <aside className="space-y-4">
            <SurfaceCard premium className="p-6">
              <SectionHeader eyebrow="Qué aprenderás" title="Preparación real para el plazo" />
              <ul className="mt-4 space-y-2 text-sm text-[var(--ink-soft)]">
                <li>Requisitos y documentación necesaria</li>
                <li>Errores frecuentes que hacen perder la oportunidad</li>
                <li>Cómo actuar rápido cuando se abre la convocatoria</li>
              </ul>
              <div className="mt-5">
                <CourseAccessLink
                  hrefWhenAccess={courseEntryHref}
                  hrefWhenLocked={lockedAccessHref}
                  lockedLabel={includedInPro ? proPlan.ctaLabel : lockedAccessLabel}
                  accessLabel={hasLessons ? 'Empezar curso' : 'Ver índice'}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[var(--green-700)] px-5 py-2.5 text-sm font-bold text-white shadow-glow transition hover:bg-[var(--green-900)]"
                />
              </div>
            </SurfaceCard>
            <SurfaceCard premium className="p-6">
              <SectionHeader eyebrow="Acompañamiento" title="¿Necesitas revisar tu caso?" />
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                Combina el curso con acompañamiento personalizado para documentación y estrategia.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href="/acompanamiento" variant="secondary">Solicitar acompañamiento</ButtonLink>
                <Link href="/cursos" className="text-sm font-bold text-[var(--green-700)]">Ver más cursos</Link>
              </div>
            </SurfaceCard>
          </aside>
        </section>
      </CourseAccessProvider>
    </main>
  );
}
