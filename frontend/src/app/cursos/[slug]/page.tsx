import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { CourseCheckoutBanner } from '@/components/checkout/course-checkout-banner';
import { CourseAccessLink, CourseAccessProvider } from '@/components/course-access';
import { CourseCoverImage } from '@/components/course-cover-image';
import { CourseHubSection } from '@/components/course-hub-section';
import { CourseModuleIndex } from '@/components/course-module-index';
import { CoursePublicIndex } from '@/components/course-public-index';
import { CourseStickyBuyBar } from '@/components/course-sticky-buy-bar';
import { PublicPage } from '@/components/conversion/public-shell';
import { StructuredData } from '@/components/structured-data';
import { buildCourseAccessTargets } from '@/lib/course-access-targets';
import {
  COURSE_ACCESS_DURATION_TEXT,
  courseEditorial,
  describeCourseFormat,
  formatEuro,
  getCourseAuthor,
  getCoursePrice,
  getCourseStatusSummary,
  getPreviewLessonSlug,
  isCourseFree,
  isIncludedInPro,
} from '@/lib/offer';
import { proPlan } from '@/lib/pro';
import { absoluteUrl, breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import type { Course } from '@/types';

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
    keywords: ['curso vivienda protegida', course.title],
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
  const status = getCourseStatusSummary(course);
  const lessonCount = status.publishedLessons;
  const canAccess = Boolean(course.access?.canAccess);
  const includedInPro = isIncludedInPro(course);
  const isFree = isCourseFree(course);
  const price = getCoursePrice(course);
  const previewLessonSlug = getPreviewLessonSlug(course);
  const editorial = courseEditorial[course.slug];
  const author = getCourseAuthor();
  const formatParts = describeCourseFormat(course);
  const moduleObjectives = modules.filter(
    (module) => module.description && module.description.trim() && module.description.trim() !== module.title.trim(),
  );

  const {
    accessHref: courseEntryHref,
    lockedHref: lockedAccessHref,
    lockedLabel: lockedAccessLabel,
    hasLessons,
  } = buildCourseAccessTargets(course);

  const priceLabel = isFree ? 'Gratis' : price !== null ? formatEuro(price) : 'Consultar precio';

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDescription || course.longDescription || 'Curso práctico de vivienda protegida.',
    url: absoluteUrl(`/cursos/${course.slug}`),
    provider: {
      '@type': 'Organization',
      name: 'Radar VPO',
    },
    offers:
      price !== null && status.sellable
        ? {
            '@type': 'Offer',
            price: String(price),
            priceCurrency: course.currency || 'EUR',
            availability: 'https://schema.org/InStock',
          }
        : undefined,
  };

  return (
    <PublicPage className={canAccess ? undefined : 'course-detail--locked'}>
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
        <CourseCheckoutBanner slug={course.slug} />
        <header className="lp-page-hero lp-page-hero--flush">
          <div className="relative h-40 sm:h-48 md:h-56">
            <CourseCoverImage
              slug={course.slug}
              src={course.coverImage}
              alt={course.title}
              className="h-full w-full object-cover"
              label={course.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,18,32,0.85)] via-[rgba(11,18,32,0.35)] to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 md:text-[11px]">Curso Radar VPO</p>
              <h1 className="display-type mt-1 text-2xl font-black text-white sm:mt-2 sm:text-3xl md:text-5xl">{course.title}</h1>
            </div>
          </div>
          <div className={`shell py-4 md:py-5 ${canAccess ? '' : 'md:grid md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-8'}`}>
            <div className="min-w-0">
              <p className="text-sm leading-7 text-[var(--ink-soft)] md:text-base">
                {course.longDescription || course.shortDescription || 'Formación práctica para preparar tu solicitud de vivienda protegida.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)] md:mt-5">
                <span className="rounded-full bg-[var(--bg-app)] px-3 py-1">{status.statusText}</span>
                {canAccess ? (
                  <span className="rounded-full bg-[rgba(22,112,85,0.12)] px-3 py-1 text-[var(--green-700)]">Acceso activo</span>
                ) : !status.sellable && !isFree ? (
                  <span className="rounded-full bg-[rgba(232,184,74,0.16)] px-3 py-1 text-[#7a5600]">En preparación</span>
                ) : null}
              </div>
              {canAccess && hasLessons ? (
                <div className="mt-5 lg:hidden">
                  <CourseAccessLink
                    hrefWhenAccess={courseEntryHref}
                    hrefWhenLocked={lockedAccessHref}
                    lockedLabel={lockedAccessLabel}
                    accessLabel="Continuar curso"
                    className="inline-flex w-full items-center justify-center rounded-full bg-[var(--green-700)] px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-[var(--green-900)] sm:w-auto"
                  />
                </div>
              ) : null}
            </div>
            {!canAccess ? (
              <aside id="precio" className="course-progress-card flex scroll-mt-24 flex-col gap-4 p-5 md:p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                    {status.sellable || isFree ? 'Precio' : 'Precio previsto'}
                  </p>
                  <p className="display-type mt-2 text-3xl font-black text-white">{priceLabel}</p>
                  {!isFree && price !== null ? (
                    <p className="mt-1 text-xs text-white/70">Pago único · sin renovaciones</p>
                  ) : null}
                </div>

                {status.sellable || isFree ? (
                  <CourseAccessLink
                    hrefWhenAccess={courseEntryHref}
                    hrefWhenLocked={lockedAccessHref}
                    lockedLabel={lockedAccessLabel}
                    accessLabel={hasLessons ? 'Continuar curso' : 'Ver índice'}
                    className="flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]"
                  />
                ) : (
                  <p className="rounded-xl bg-white/10 px-3 py-2 text-sm leading-6 text-white/90">
                    Este curso todavía se está preparando ({status.statusText}). No se puede comprar hasta que
                    tenga contenido publicado suficiente.
                  </p>
                )}

                <ul className="space-y-1.5 text-xs leading-5 text-white/75">
                  <li>{COURSE_ACCESS_DURATION_TEXT}</li>
                  {includedInPro ? (
                    <li>
                      Si ya tienes {proPlan.name} activo ({proPlan.price}), este curso está incluido mientras la
                      suscripción siga activa.{' '}
                      <Link href="/pro" className="font-bold underline">
                        Ver PRO
                      </Link>
                    </li>
                  ) : null}
                </ul>

                {previewLessonSlug ? (
                  <Link
                    href={`/cursos/${course.slug}/${previewLessonSlug}`}
                    className="text-sm font-bold text-white underline"
                  >
                    Ver una lección de muestra gratis
                  </Link>
                ) : null}
              </aside>
            ) : null}
          </div>
        </header>

        <CourseHubSection course={course} lessonCount={lessonCount} />

        <CoursePublicIndex>
          <section id="indice" className="shell scroll-mt-24 pb-8 md:pb-12">
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-5">
              <article className="public-card p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
                      Programa
                    </p>
                    <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)] md:text-2xl">
                      Índice del curso
                    </h2>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">
                      {modules.length > 0
                        ? 'Los módulos sin lecciones todavía están en preparación.'
                        : 'El programa de este curso aún no está publicado.'}
                    </p>
                  </div>
                  {lessonCount > 0 ? (
                    <span className="shrink-0 rounded-full bg-[var(--bg-eco)] px-3 py-1 text-xs font-bold text-[var(--green-700)]">
                      {lessonCount} lecc.
                    </span>
                  ) : null}
                </div>
                <div className="mt-5">
                  <CourseModuleIndex
                    courseSlug={course.slug}
                    modules={modules}
                    mode="access"
                    defaultOpenFirst
                    locked={!canAccess}
                    previewLessonSlug={previewLessonSlug}
                  />
                </div>
              </article>

              <aside className="space-y-4">
                {editorial ? (
                  <article className="public-card p-5 md:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
                      Para quién es
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--ink-soft)]">
                      {editorial.audience.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </article>
                ) : null}

                {moduleObjectives.length > 0 ? (
                  <article className="public-card p-5 md:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
                      Qué trabajarás
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--ink-soft)]">
                      {moduleObjectives.map((module) => (
                        <li key={module.id}>
                          <strong className="text-[var(--ink)]">{module.title}:</strong> {module.description}
                        </li>
                      ))}
                    </ul>
                  </article>
                ) : null}

                <article className="public-card p-5 md:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
                    Qué incluye hoy
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--ink-soft)]">
                    <li>{status.statusText}</li>
                    {formatParts.length > 0 ? <li>{formatParts.join(' · ')}</li> : null}
                    <li>{COURSE_ACCESS_DURATION_TEXT}</li>
                  </ul>
                </article>

                {author ? (
                  <article className="public-card p-5 md:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
                      Autoría
                    </p>
                    <h3 className="display-type mt-2 text-lg font-black text-[var(--ink)]">{author.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{author.bio}</p>
                  </article>
                ) : null}

                <Link href="/cursos" className="inline-block text-sm font-bold text-[var(--green-700)]">
                  Ver todos los cursos
                </Link>
              </aside>
            </div>
          </section>
        </CoursePublicIndex>
        {!canAccess && (status.sellable || isFree) ? (
          <CourseStickyBuyBar
            priceLabel={priceLabel}
            lockedHref={lockedAccessHref}
            lockedLabel={lockedAccessLabel}
            hint={includedInPro ? `Incluido con ${proPlan.name} activo` : undefined}
          />
        ) : null}
      </CourseAccessProvider>
    </PublicPage>
  );
}
