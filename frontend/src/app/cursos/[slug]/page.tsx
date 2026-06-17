import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { CourseAccessLink, CourseAccessProvider, CourseLessonAccessLink } from '@/components/course-access';
import { StructuredData } from '@/components/structured-data';
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
    },
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return response.json() as Promise<Course>;
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
  const firstLesson = modules.flatMap((module) => module.lessons || [])[0];
  const canAccess = Boolean(course.access?.canAccess);
  const includedInPro = course.accessType === 'pro';
  const courseEntryHref = firstLesson
    ? `/cursos/${course.slug}/${firstLesson.slug}`
    : `/account`;
  const lockedAccessHref = includedInPro
    ? proHref
    : course.stripePaymentLink || `/login?next=${encodeURIComponent(`/cursos/${course.slug}`)}`;
  const lockedAccessLabel = includedInPro
    ? 'Activar Radar VPO Pro'
    : course.stripePaymentLink
    ? 'Comprar curso'
    : course.pricingType === 'free'
      ? 'Entrar al curso'
      : 'Solicitar acceso';
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
      : 'Acceso bajo solicitud';
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
      <CourseAccessProvider slug={course.slug} initialCanAccess={canAccess}>
      <header className="relative overflow-hidden rounded-[2.5rem] border border-[var(--stroke)] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-soft)]">Curso Radar VPO</p>
            <h1 className="mt-3 text-4xl font-black text-[var(--ink)] display-type">{course.title}</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              {course.longDescription || course.shortDescription || 'Descripcion pendiente.'}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Precio</p>
                <p className="mt-1 text-lg font-black text-[var(--ink)]">
                  {originalPriceLabel ? <span className="mr-2 text-sm text-[var(--ink-soft)] line-through">{originalPriceLabel}</span> : null}
                  {priceLabel}
                </p>
                {onSale ? <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[var(--green-700)]">Oferta activa</p> : null}
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Lecciones</p>
                <p className="mt-1 text-lg font-black text-[var(--ink)]">{lessonCount}</p>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Acceso</p>
                <p className="mt-1 text-lg font-black text-[var(--ink)]">{includedInPro ? 'Incluido en Pro' : course.accessType}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/cursos"
                className="rounded-full border border-[var(--stroke)] bg-white px-5 py-2 text-sm font-semibold text-[var(--ink)]"
              >
                Volver a cursos
              </Link>
              <CourseAccessLink
                hrefWhenAccess={courseEntryHref}
                hrefWhenLocked={lockedAccessHref}
                lockedLabel={lockedAccessLabel}
                className="rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-white"
              />
            </div>
          </div>
          <div className="border-t border-[var(--stroke)] bg-[linear-gradient(160deg,#f8fafc,white)] p-6 sm:p-8 lg:border-l lg:border-t-0">
            {course.coverImage ? (
              <div className="relative mb-4 h-40 overflow-hidden rounded-2xl border border-[var(--stroke)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Acceso</p>
              <p className="mt-2 text-2xl font-black text-[var(--green-700)]">Landing pública</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {includedInPro
                  ? `${proPlan.name} incluye este curso. Si ya eres Pro, podrás entrar directamente a las lecciones.`
                  : 'Puedes consultar el temario y comprar o solicitar acceso. Las lecciones completas requieren sesión y permiso activo.'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Indice del curso</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Modulos y lecciones visibles para decidir si el curso encaja con tu situación.
          </p>
          <div className="mt-4 space-y-3">
            {modules.map((module, index) => (
              <details key={module.id} className="group rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                      Modulo {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-[var(--ink)]">{module.title}</h3>
                    {module.description ? (
                      <p className="mt-1 text-xs text-[var(--ink-soft)]">{module.description}</p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                    {module.lessons?.length || 0} lecciones
                  </span>
                </summary>
                <div className="mt-3 space-y-2">
                  {(module.lessons || []).map((lesson) => (
                    <CourseLessonAccessLink
                      key={lesson.id}
                      courseSlug={course.slug}
                      lessonSlug={lesson.slug}
                      className="flex items-center justify-between rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm transition hover:bg-white"
                    >
                      <span className="font-semibold text-[var(--ink)]">{lesson.title}</span>
                      <span className="text-xs text-[var(--ink-soft)]">
                        {lesson.durationMinutes ? `${lesson.durationMinutes} min` : 'Leccion'}
                      </span>
                    </CourseLessonAccessLink>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </article>

        <aside className="space-y-4">
          <SurfaceCard className="p-6">
            <SectionHeader eyebrow="Qué conseguirás" title="Más claridad antes de solicitar" />
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Entenderás requisitos, plazos, errores frecuentes y criterios prácticos para presentarte con más margen.
            </p>
            <div className="mt-5">
              <CourseAccessLink
                hrefWhenAccess={courseEntryHref}
                hrefWhenLocked={lockedAccessHref}
                lockedLabel={includedInPro ? 'Activar Radar VPO Pro' : course.stripePaymentLink ? 'Comprar curso' : 'Solicitar acceso'}
                className="inline-flex items-center justify-center rounded-full bg-[var(--green-700)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--green-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
              />
            </div>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <SectionHeader eyebrow="Upsell" title="¿Tienes un caso concreto?" />
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Combina el curso con seguimiento o asesoría si necesitas revisar documentación, requisitos o estrategia.
            </p>
            <div className="mt-5">
              <ButtonLink href="/services" variant="secondary">Ver servicios</ButtonLink>
            </div>
          </SurfaceCard>
        </aside>
      </section>
      </CourseAccessProvider>
    </main>
  );
}
