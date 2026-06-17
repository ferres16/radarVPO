import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata, faqJsonLd } from '@/lib/seo';
import { proHref, proPlan, starterCourseKeywords } from '@/lib/pro';
import type { Course } from '@/types';

export const metadata: Metadata = createMetadata({
  title: 'Curso de iniciación incluido con Radar VPO Pro',
  description:
    'Radar VPO Pro incluye el curso de iniciación a la vivienda pública para entender requisitos, documentación, adjudicaciones y errores frecuentes.',
  path: '/cursos',
  keywords: ['curso iniciación vivienda pública', 'Radar VPO Pro', 'curso VPO Cataluña'],
});

const accessLabels: Record<string, string> = {
  free: 'Intro',
  paid: 'Curso premium',
  pro: 'Plan PRO',
  seguimiento: 'Seguimiento',
};

const accessTone: Record<string, string> = {
  free: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-amber-100 text-amber-800',
  pro: 'bg-indigo-100 text-indigo-700',
  seguimiento: 'bg-slate-900 text-white',
};

const formatPrice = (price?: string | number | null, currency?: string | null) => {
  if (!price) return null;
  const amount = typeof price === 'string' ? Number(price) : price;
  if (!Number.isFinite(amount)) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 0,
  }).format(amount as number);
};

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

const isExternalUrl = (href: string) => /^https?:\/\//.test(href);

const faqs = [
  {
    question: '¿Los cursos sirven si todavía no tengo una promoción concreta?',
    answer: 'Sí. Están diseñados para preparar requisitos, documentación y criterio antes de que se abra una convocatoria.',
  },
  {
    question: '¿Qué curso incluye Radar VPO Pro?',
    answer: `Pro incluye el ${proPlan.courseLabel.toLowerCase()}, pensado para entender el proceso antes de solicitar.`,
  },
  {
    question: '¿Puedo comprar cursos sueltos?',
    answer: 'Sí, si el catálogo incluye cursos premium independientes. Aun así, el camino principal recomendado es Radar VPO Pro.',
  },
];

function courseJsonLd(course: Course) {
  const salePrice = getCourseSalePrice(course);
  const offerPrice = isOnSale(salePrice) ? salePrice : course.price;
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDescription || course.longDescription || 'Curso practico de vivienda protegida.',
    provider: {
      '@type': 'Organization',
      name: 'Radar VPO',
    },
    offers: offerPrice
      ? {
          '@type': 'Offer',
          price: String(offerPrice),
          priceCurrency: course.currency || 'EUR',
          availability: 'https://schema.org/InStock',
        }
      : undefined,
  };
}

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
    <main className="shell space-y-6 pb-16">
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Cursos', path: '/cursos' },
          ]),
          faqJsonLd(faqs),
          ...visibleCourses.map(courseJsonLd),
        ]}
      />
      <PageHero
        eyebrow="Formación incluida en Pro"
        title="Empieza por el curso de iniciación a la vivienda pública"
        description={`${proPlan.name} incluye formación práctica para entender requisitos, documentación, plazos, adjudicaciones y errores frecuentes antes de solicitar.`}
        actions={
          <>
            <ButtonLink href={proHref}>Activar Pro por {proPlan.price}</ButtonLink>
            <ButtonLink href="#catalogo" variant="secondary">Ver temarios</ButtonLink>
          </>
        }
      >
        <SurfaceCard className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Incluido con Pro</p>
          <ul className="mt-4 space-y-3 text-sm font-semibold text-[var(--ink)]">
            <li>Preparar documentación con antelación.</li>
            <li>Entender requisitos económicos y familiares.</li>
            <li>Evitar errores que te dejan fuera de una convocatoria.</li>
            <li>Recibir alertas SMS y correo además del curso.</li>
          </ul>
        </SurfaceCard>
      </PageHero>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <SurfaceCard className="p-6">
          <SectionHeader eyebrow="Ruta recomendada" title={starterCourse?.title || proPlan.courseLabel} />
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            El curso de iniciación es la base para aprovechar las alertas: te ayuda a saber si cumples requisitos, qué documentos preparar y cómo actuar cuando llegue un aviso.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={starterCourse ? `/cursos/${starterCourse.slug}` : proHref}>Ver curso incluido</ButtonLink>
            <ButtonLink href={proHref} variant="secondary">Activar Radar VPO Pro</ButtonLink>
          </div>
        </SurfaceCard>
        <SurfaceCard className="p-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Plan completo</p>
          <p className="display-type mt-3 text-4xl font-black text-[var(--ink)]">{proPlan.price}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            Curso de iniciación, alertas SMS y alertas por correo en un único plan mensual.
          </p>
        </SurfaceCard>
      </section>

      {visibleCourses.length === 0 ? (
        <EmptyState
          title="Aun no hay cursos publicados"
          description="El catálogo se mostrará aquí cuando el equipo publique el primer curso."
        />
      ) : null}

      <section id="catalogo" className="space-y-4">
        <SectionHeader
          eyebrow="Catálogo"
          title="Temarios y cursos disponibles"
          description="El curso de iniciación forma parte de Pro. Otros cursos pueden ampliar temas concretos si están publicados."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleCourses.map((course) => {
          const includedInPro = course.id === starterCourse?.id || course.accessType === 'pro';
          const badge = includedInPro
            ? 'Incluido en Pro'
            : course.pricingType === 'premium'
            ? 'Curso premium'
            : accessLabels[course.accessType] || 'Acceso';
          const salePrice = getCourseSalePrice(course);
          const onSale = isOnSale(salePrice);
          const priceLabel = formatPrice(onSale ? salePrice : course.price, course.currency);
          const originalPriceLabel = onSale ? formatPrice(course.price, course.currency) : null;
          const ctaHref = includedInPro ? `/cursos/${course.slug}` : course.stripePaymentLink || `/cursos/${course.slug}`;
          const ctaLabel = includedInPro ? 'Ver curso incluido' : course.stripePaymentLink ? 'Comprar curso' : 'Ver temario';
          const external = isExternalUrl(ctaHref);
          return (
            <article key={course.id} className="group relative overflow-hidden rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(30,31,28,0.13)]">
              <div className="absolute -right-10 top-6 h-24 w-24 rounded-full bg-[rgba(14,116,144,0.08)] blur-2xl" />
              <div className="relative space-y-4">
                {course.coverImage ? (
                  <div className="relative h-40 overflow-hidden rounded-2xl border border-[var(--stroke)]">
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.0),rgba(0,0,0,0.4))]" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.coverImage}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {onSale ? (
                      <span className="absolute left-3 top-3 rounded-full bg-[var(--green-700)] px-3 py-1 text-xs font-black text-white">
                        Oferta
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex h-40 items-end rounded-2xl border border-[var(--stroke)] bg-[radial-gradient(circle_at_top,#dcfce7,#f8fafc_65%)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--green-700)]">Formación práctica</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accessTone[course.accessType] || 'bg-slate-100 text-slate-700'}`}>
                    {badge}
                  </span>
                  <span className="rounded-full bg-[var(--bg-eco)] px-3 py-1 text-xs font-bold text-[var(--green-700)]">
                    {onSale ? 'En oferta' : priceLabel || 'Ver acceso'}
                  </span>
                </div>
                <div>
                  <h2 className="display-type text-xl font-black text-[var(--ink)]">
                    {course.title}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    {course.shortDescription || 'Curso sin descripcion corta.'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                    {course.modules?.length ?? 0} modulos
                  </span>
                  <div className="flex items-center gap-3">
                    {priceLabel ? (
                      <span className="text-xs font-semibold text-[var(--ink)]">
                        {originalPriceLabel ? <span className="mr-1 text-[var(--ink-soft)] line-through">{originalPriceLabel}</span> : null}
                        {priceLabel}
                      </span>
                    ) : null}
                    {external ? (
                      <a
                        href={ctaHref}
                        className="rounded-full bg-[var(--green-500)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--green-700)]"
                        rel="noopener noreferrer"
                      >
                        {ctaLabel}
                      </a>
                    ) : (
                      <Link
                        href={ctaHref}
                        className="rounded-full bg-[var(--green-500)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--green-700)]"
                      >
                        {ctaLabel}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <SurfaceCard className="p-6">
          <SectionHeader eyebrow="FAQ" title="Dudas antes de comprar" />
          <div className="mt-4 space-y-3">
            {faqs.map((item) => (
              <details key={item.question} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
                <summary className="cursor-pointer text-sm font-bold text-[var(--ink)]">{item.question}</summary>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.answer}</p>
              </details>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard className="p-6">
          <SectionHeader eyebrow="Siguiente paso" title="¿No sabes qué curso elegir?" />
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            Si tienes una convocatoria concreta, combina formación con asesoría o seguimiento premium para revisar tu caso.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/services">Pedir asesoría</ButtonLink>
            <ButtonLink href="/register?intent=alerts" variant="secondary">Activar alertas</ButtonLink>
          </div>
        </SurfaceCard>
      </section>
    </main>
  );
}
