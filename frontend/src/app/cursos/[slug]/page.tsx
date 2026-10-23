import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { CheckoutPanel } from '@/components/checkout/checkout-panel';
import { CourseCheckoutBanner } from '@/components/checkout/course-checkout-banner';
import { AccessSwitch, CourseAccessLink, CourseAccessProvider, LockedOnly } from '@/components/course-access';
import { CourseCoverImage } from '@/components/course-cover-image';
import { CourseHubSection } from '@/components/course-hub-section';
import { CourseModuleIndex } from '@/components/course-module-index';
import { CoursePublicIndex } from '@/components/course-public-index';
import { CourseStickyBuyBar } from '@/components/course-sticky-buy-bar';
import { GuidePdfViewer } from '@/components/guide-pdf-viewer';
import { GuideVpoOutline } from '@/components/conversion/guide-vpo-outline';
import { PageViewTracker } from '@/components/conversion/page-view-tracker';
import { PublicPage } from '@/components/conversion/public-shell';
import { StructuredData } from '@/components/structured-data';
import { buildCourseAccessTargets } from '@/lib/course-access-targets';
import {
  COURSE_ACCESS_DURATION_TEXT,
  GUIDE_FORMAT_TEXT,
  courseEditorial,
  getCoursePayBullets,
  describeCourseFormat,
  formatEuro,
  getCourseAuthor,
  getCoursePrice,
  getCourseStatusSummary,
  getGuideTopics,
  getPreviewLessonSlug,
  isCourseFree,
  isGuidePdf,
  isIncludedInPro,
} from '@/lib/offer';
import { getCourseCoverSrc } from '@/lib/course-media-url';
import {
  GUIDE_VPO_FAQS,
  GUIDE_VPO_SEO_DESCRIPTION,
  getPublicCourseDescription,
  getPublicCourseTitle,
  isGuideVpoSlug,
} from '@/lib/guide-vpo';
import { isInternalCatalogCourse } from '@/lib/public-courses';
import { proPlan } from '@/lib/pro';
import { absoluteUrl, breadcrumbJsonLd, createMetadata, faqJsonLd } from '@/lib/seo';
import type { Course } from '@/types';

export const dynamic = 'force-dynamic';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:3000/api/v1';

type CourseDetailParams = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ canceled?: string }>;
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

  if (!course || isInternalCatalogCourse(course)) {
    return createMetadata({
      title: 'Guía no disponible',
      description: 'Contenido de Radar VPO no disponible.',
      path: `/cursos/${slug}`,
    });
  }

  const guide = course.format === 'guide_pdf';
  const branded = isGuideVpoSlug(course.slug);
  const publicTitle = getPublicCourseTitle(course);
  return createMetadata({
    title: course.seoTitle || publicTitle,
    description:
      course.seoDescription ||
      (branded
        ? GUIDE_VPO_SEO_DESCRIPTION
        : course.shortDescription ||
          course.longDescription ||
          (guide
            ? 'Guía Radar VPO sobre vivienda protegida en Cataluña.'
            : 'Formación práctica de vivienda protegida en Cataluña.')),
    path: `/cursos/${course.slug}`,
    image: getCourseCoverSrc(course.slug, course.coverImage) || undefined,
    keywords: [
      guide ? 'guía VPO' : 'curso vivienda protegida',
      publicTitle,
      ...(branded
        ? ['registro solicitantes VPO', 'documentación VPO', 'derecho de superficie', 'Catalunya']
        : []),
    ],
  });
}

export default async function CourseDetailPage({ params, searchParams }: CourseDetailParams) {
  const { slug } = await params;
  const canceled = (await searchParams)?.canceled === '1';
  const [publicCourse, courseWithAccess] = await Promise.all([
    getPublicCourse(slug),
    getCourseWithAccess(slug),
  ]);
  const course = courseWithAccess || publicCourse;

  if (!course || (isInternalCatalogCourse(course) && !course.access?.canAccess)) {
    return notFound();
  }

  const modules = course.modules || [];
  const status = getCourseStatusSummary(course);
  const lessonCount = status.publishedLessons;
  const canAccess = Boolean(course.access?.canAccess);
  const guideMode = isGuidePdf(course);
  const brandedGuide = isGuideVpoSlug(course.slug);
  const publicTitle = getPublicCourseTitle(course);
  const publicDescription = getPublicCourseDescription(course);
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
    accessLabel: courseAccessLabel,
    hasLessons,
  } = buildCourseAccessTargets(course);
  const guideTopics = getGuideTopics(course);

  const priceLabel = isFree ? 'Gratis' : price !== null ? formatEuro(price) : 'Consultar precio';

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: publicTitle,
    description: brandedGuide
      ? GUIDE_VPO_SEO_DESCRIPTION
      : course.shortDescription || course.longDescription || 'Curso práctico de vivienda protegida.',
    url: absoluteUrl(`/cursos/${course.slug}`),
    image: getCourseCoverSrc(course.slug, course.coverImage)
      ? absoluteUrl(getCourseCoverSrc(course.slug, course.coverImage) as string)
      : undefined,
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
      <PageViewTracker event="course_page_viewed" properties={{ course: course.slug, sellable: status.sellable }} />
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Guías', path: '/cursos' },
            { name: publicTitle, path: `/cursos/${course.slug}` },
          ]),
          courseJsonLd,
          ...(brandedGuide ? [faqJsonLd([...GUIDE_VPO_FAQS])] : []),
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
          {guideMode ? null : (
          <div className="relative h-40 sm:h-48 md:h-56">
            <CourseCoverImage
              slug={course.slug}
              src={course.coverImage}
              alt={course.title}
              className="h-full w-full object-cover object-top"
              label={course.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,18,32,0.85)] via-[rgba(11,18,32,0.35)] to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 md:text-[11px]">
                Curso Radar VPO
              </p>
              <h1 className="display-type mt-1 text-2xl font-black text-white sm:mt-2 sm:text-3xl md:text-5xl">{course.title}</h1>
            </div>
          </div>
          )}
          <div className={`shell py-4 md:py-5 ${
            guideMode
              ? 'md:grid md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:items-start md:gap-8'
              : canAccess
                ? ''
                : 'md:grid md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-8'
          }`}>
            {guideMode ? (
              <div className="overflow-hidden rounded-[1.5rem] border border-[var(--stroke)] bg-[#f4efe6] shadow-sm">
                <CourseCoverImage
                  slug={course.slug}
                  src={course.coverImage}
                  alt={`Portada de ${publicTitle}`}
                  className="h-auto w-full object-contain"
                  label={publicTitle}
                />
              </div>
            ) : null}
            <div className={`min-w-0 ${guideMode && !canAccess ? 'grid gap-5' : ''}`}>
              {guideMode ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--green-700)] md:text-[11px]">
                    Guía Radar VPO
                  </p>
                  <h1 className="display-type mt-1 text-2xl font-black text-[var(--ink)] sm:mt-2 sm:text-3xl md:text-4xl">
                    {publicTitle}
                  </h1>
                </div>
              ) : null}
              {guideMode ? (
                <AccessSwitch
                  fallback={
                    <p className="text-sm leading-7 text-[var(--ink-soft)] md:text-base">
                      {publicDescription}
                    </p>
                  }
                >
                  <p className="text-sm leading-7 text-[var(--ink-soft)] md:text-base">
                    Acceso activo. Entra a la lectura, sin volver a pagar.
                  </p>
                </AccessSwitch>
              ) : (
                <p className="text-sm leading-7 text-[var(--ink-soft)] md:text-base">
                  {course.longDescription ||
                    course.shortDescription ||
                    'Formación práctica sobre vivienda protegida en Cataluña.'}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)] md:mt-5">
                <span className="rounded-full bg-[var(--bg-app)] px-3 py-1">{status.statusText}</span>
                {canAccess ? (
                  <span className="rounded-full bg-[rgba(22,112,85,0.12)] px-3 py-1 text-[var(--green-700)]">Acceso activo</span>
                ) : !status.sellable && !isFree ? (
                  <span className="rounded-full bg-[rgba(232,184,74,0.16)] px-3 py-1 text-[#7a5600]">En preparación</span>
                ) : null}
              </div>
              {guideMode ? (
                <AccessSwitch
                  fallback={null}
                >
                  <div className="mt-5">
                    <a
                      href="#guia"
                      className="inline-flex w-full items-center justify-center rounded-full bg-[var(--green-700)] px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-[var(--green-900)] sm:w-auto"
                    >
                      Abrir la guía
                    </a>
                  </div>
                </AccessSwitch>
              ) : canAccess && hasLessons ? (
                <div className="mt-5">
                  <CourseAccessLink
                    hrefWhenAccess={courseEntryHref}
                    hrefWhenLocked={lockedAccessHref}
                    lockedLabel={lockedAccessLabel}
                    accessLabel={courseAccessLabel}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[var(--green-700)] px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-[var(--green-900)] sm:w-auto"
                  />
                </div>
              ) : null}
            {guideMode && !canAccess ? (
              <LockedOnly>
              <aside id="pagar" className="scroll-mt-24">
                {status.sellable ? (
                  <CheckoutPanel
                    layout="embedded"
                    canceled={canceled}
                    summary={{
                      product: 'course',
                      courseSlug: course.slug,
                      title: publicTitle,
                      priceLabel,
                      cadenceLabel: 'pago único',
                      recurrenceNote: 'Sin renovaciones. Acceso inmediato al confirmar el pago.',
                      bullets: getCoursePayBullets(course),
                      backHref: '/cursos',
                      backLabel: 'Ver todas las guías',
                    }}
                  />
                ) : (
                  <div className="course-progress-card flex flex-col gap-4 p-5 md:p-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                        {isFree ? 'Precio' : 'Precio previsto'}
                      </p>
                      <p className="display-type mt-2 text-3xl font-black text-white">{priceLabel}</p>
                    </div>
                    {isFree ? (
                      <CourseAccessLink
                        hrefWhenAccess={courseEntryHref}
                        hrefWhenLocked={lockedAccessHref}
                        lockedLabel={lockedAccessLabel}
                        accessLabel={courseAccessLabel}
                        className="flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]"
                      />
                    ) : (
                      <p className="rounded-xl bg-white/10 px-3 py-2 text-sm leading-6 text-white/90">
                        {guideMode
                          ? `Esta guía todavía se está preparando (${status.statusText}). Sube el PDF para ponerla a la venta.`
                          : `Este curso todavía se está preparando (${status.statusText}). No se puede comprar hasta que tenga contenido publicado suficiente.`}
                      </p>
                    )}
                    {includedInPro ? (
                      <p className="text-xs leading-5 text-white/75">
                        Incluido con {proPlan.name} activo ({proPlan.price}).{' '}
                        <Link href="/pro#pagar" className="font-bold underline">
                          Ver PRO
                        </Link>
                      </p>
                    ) : null}
                  </div>
                )}
              </aside>
              </LockedOnly>
            ) : null}
            </div>
            {!guideMode && !canAccess ? (
              <aside id="pagar" className="scroll-mt-24">
                {status.sellable ? (
                  <CheckoutPanel
                    layout="embedded"
                    canceled={canceled}
                    summary={{
                      product: 'course',
                      courseSlug: course.slug,
                      title: publicTitle,
                      priceLabel,
                      cadenceLabel: 'pago único',
                      recurrenceNote: 'Sin renovaciones. Acceso inmediato al confirmar el pago.',
                      bullets: getCoursePayBullets(course),
                      backHref: '/cursos',
                      backLabel: 'Ver todas las guías',
                    }}
                  />
                ) : (
                  <div className="course-progress-card flex flex-col gap-4 p-5 md:p-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                        {isFree ? 'Precio' : 'Precio previsto'}
                      </p>
                      <p className="display-type mt-2 text-3xl font-black text-white">{priceLabel}</p>
                    </div>
                    {isFree ? (
                      <CourseAccessLink
                        hrefWhenAccess={courseEntryHref}
                        hrefWhenLocked={lockedAccessHref}
                        lockedLabel={lockedAccessLabel}
                        accessLabel={courseAccessLabel}
                        className="flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]"
                      />
                    ) : (
                      <p className="rounded-xl bg-white/10 px-3 py-2 text-sm leading-6 text-white/90">
                        Este curso todavía se está preparando ({status.statusText}). No se puede comprar hasta que tenga contenido publicado suficiente.
                      </p>
                    )}
                    {includedInPro ? (
                      <p className="text-xs leading-5 text-white/75">
                        Incluido con {proPlan.name} activo ({proPlan.price}).{' '}
                        <Link href="/pro#pagar" className="font-bold underline">
                          Ver PRO
                        </Link>
                      </p>
                    ) : null}
                  </div>
                )}
              </aside>
            ) : null}
          </div>
        </header>

        {guideMode ? (
          <section className="shell scroll-mt-24 space-y-6 py-6 md:py-8">
            <LockedOnly>
              {brandedGuide ? (
                <GuideVpoOutline />
              ) : (
                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
                  <article className="public-card p-5 md:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
                      Por qué esta guía
                    </p>
                    <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)] md:text-2xl">
                      Lo que necesitas saber, sin rodeos
                    </h2>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)] md:text-base">
                      {course.longDescription ||
                        course.shortDescription ||
                        'Contenido claro para orientarte con criterio en vivienda protegida.'}
                    </p>
                    <p className="mt-4 text-xs leading-5 text-[var(--ink-soft)]">
                      Lectura en pantalla · no descargable
                    </p>
                  </article>

                  <article className="public-card p-5 md:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
                      Dentro encontrarás
                    </p>
                    <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)] md:text-2xl">
                      Temas clave
                    </h2>
                    {guideTopics.length > 0 ? (
                      <ul className="mt-4 space-y-2.5">
                        {guideTopics.map((topic) => (
                          <li
                            key={topic}
                            className="flex gap-2 text-sm leading-6 text-[var(--ink-soft)]"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green-700)]" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-[var(--ink-soft)]">
                        Los temas de esta guía aparecerán aquí.
                      </p>
                    )}
                  </article>
                </div>
              )}
            </LockedOnly>

            <article id="guia" className="public-card scroll-mt-24 p-4 md:p-6">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
                  Lectura
                </p>
                <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)] md:text-2xl">
                  {canAccess || isFree ? 'Tu guía' : 'Empieza ahora'}
                </h2>
              </div>
              <AccessSwitch
                fallback={
                  <p className="text-sm leading-6 text-[var(--ink-soft)]">
                    La guía se abre aquí en cuanto actives el acceso. No hace falta descargar nada.
                  </p>
                }
              >
                <GuidePdfViewer slug={course.slug} title={publicTitle} canAccess />
              </AccessSwitch>
            </article>

            <div className="pb-2">
              <Link href="/cursos" className="text-sm font-bold text-[var(--green-700)]">
                Ver todas las guías
              </Link>
            </div>
          </section>
        ) : null}

        {!guideMode ? <CourseHubSection course={course} lessonCount={lessonCount} /> : null}

        {!guideMode ? (
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
                    {editorial.outcomes.length > 0 ? (
                      <>
                        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
                          Qué sabrás hacer
                        </p>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--ink-soft)]">
                          {editorial.outcomes.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </>
                    ) : null}
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
                    {guideMode ? <li>{GUIDE_FORMAT_TEXT}</li> : null}
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
                  Ver todas las guías
                </Link>
              </aside>
            </div>
          </section>
        </CoursePublicIndex>
        ) : null}
        {!canAccess && (status.sellable || isFree) ? (
          <CourseStickyBuyBar
            priceLabel={priceLabel}
            lockedHref="#pagar"
            lockedLabel={status.sellable ? `Pagar ${priceLabel}` : lockedAccessLabel}
            hint={includedInPro ? `Incluido con ${proPlan.name} activo` : undefined}
          />
        ) : null}
      </CourseAccessProvider>
    </PublicPage>
  );
}
