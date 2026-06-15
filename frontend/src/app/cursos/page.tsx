import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata, faqJsonLd } from '@/lib/seo';
import type { Course } from '@/types';

export const metadata: Metadata = createMetadata({
  title: 'Cursos de vivienda protegida',
  description:
    'Cursos prácticos para entender vivienda protegida, requisitos VPO/HPO, documentación, adjudicaciones y errores frecuentes antes de solicitar.',
  path: '/cursos',
  keywords: ['cursos vivienda protegida', 'HPO cataluña', 'adjudicaciones vivienda protegida'],
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

const isExternalUrl = (href: string) => /^https?:\/\//.test(href);

const faqs = [
  {
    question: '¿Los cursos sirven si todavía no tengo una promoción concreta?',
    answer: 'Sí. Están diseñados para preparar requisitos, documentación y criterio antes de que se abra una convocatoria.',
  },
  {
    question: '¿Necesito registrarme para comprar un curso?',
    answer: 'Puedes consultar el temario público. Para acceder al contenido completo necesitarás compra, plan o acceso asignado según el curso.',
  },
  {
    question: '¿Qué diferencia hay entre cursos y servicios premium?',
    answer: 'Los cursos enseñan el proceso de forma estructurada; los servicios premium revisan tu caso concreto y te acompañan en decisiones.',
  },
];

function courseJsonLd(course: Course) {
  const offerPrice = isOnSale(course.salePrice) ? course.salePrice : course.price;
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
        eyebrow="Radar VPO Academy"
        title="Cursos para entender vivienda protegida y presentar mejores solicitudes"
        description="Formación práctica para preparar requisitos, documentación, plazos, adjudicaciones y errores frecuentes antes de que una convocatoria te obligue a improvisar."
        actions={
          <>
            <ButtonLink href="#catalogo">Ver cursos</ButtonLink>
            <ButtonLink href="/services" variant="secondary">Necesito asesoría</ButtonLink>
          </>
        }
      >
        <SurfaceCard className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Aprenderás a</p>
          <ul className="mt-4 space-y-3 text-sm font-semibold text-[var(--ink)]">
            <li>Preparar documentación con antelación.</li>
            <li>Entender requisitos económicos y familiares.</li>
            <li>Evitar errores que te dejan fuera de una convocatoria.</li>
          </ul>
        </SurfaceCard>
      </PageHero>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Casos prácticos', 'Lecciones orientadas a situaciones reales de usuarios que buscan vivienda protegida.'],
          ['Acceso progresivo', 'Cursos gratuitos, premium, PRO o vinculados a seguimiento según el nivel de ayuda.'],
          ['Complemento premium', 'Cuando el curso no basta, puedes contratar revisión personalizada de tu caso.'],
        ].map(([title, copy]) => (
          <SurfaceCard key={title} className="p-5">
            <h2 className="display-type text-2xl font-black text-[var(--ink)]">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{copy}</p>
          </SurfaceCard>
        ))}
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
          title="Cursos disponibles"
          description="Cada curso debe explicar qué aprenderás, qué resultado puedes esperar y cuál es el siguiente paso para acceder."
        />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleCourses.map((course) => {
          const badge = course.pricingType === 'premium'
            ? 'Curso premium'
            : accessLabels[course.accessType] || 'Acceso';
          const onSale = isOnSale(course.salePrice);
          const priceLabel = formatPrice(onSale ? course.salePrice : course.price, course.currency);
          const originalPriceLabel = onSale ? formatPrice(course.price, course.currency) : null;
          const ctaHref = course.stripePaymentLink || `/cursos/${course.slug}`;
          const ctaLabel = course.stripePaymentLink ? 'Comprar curso' : 'Ver temario';
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
      </section>
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
