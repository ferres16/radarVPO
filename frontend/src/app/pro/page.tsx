import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ButtonLink } from '@/components/design-system';
import { HomeFaq } from '@/components/conversion/home-faq';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ProGate, ProOnlyMessage } from '@/components/pro/pro-cta';
import { ProComparison } from '@/components/pro-comparison';
import { StructuredData } from '@/components/structured-data';
import { getCourseStatusSummary, isIncludedInPro } from '@/lib/offer';
import { proFaqs, proIncludes, proLimits, proPlan } from '@/lib/pro';
import { breadcrumbJsonLd, createMetadata, faqJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Radar VPO PRO: avisos por email y SMS y organización de tus solicitudes',
  description: `Suscripción mensual (${proPlan.price}) con avisos por email y SMS de nuevas promociones de vivienda protegida y un espacio para organizar tus solicitudes. Cancela cuando quieras.`,
  path: '/pro',
  keywords: ['alertas vivienda protegida', 'avisos VPO', 'suscripción VPO'],
});

export default async function ProPage() {
  const courses = await api.listCourses().catch(() => []);
  const includedCourses = courses.filter(isIncludedInPro);

  return (
    <PublicPage>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Radar VPO PRO', path: '/pro' },
          ]),
          faqJsonLd([...proFaqs]),
        ]}
      />

      <PublicPageHero
        badge="Suscripción"
        title="Radar VPO PRO"
        titleAccent="avisos y organización"
        description={`${proPlan.price}, con renovación mensual. Cancelas cuando quieras desde Mi cuenta y mantienes el acceso hasta el final del periodo pagado.`}
        actions={
          <>
            <ProGate>
              <ButtonLink href={proPlan.checkoutHref} size="lg" block>
                {`${proPlan.ctaLabel} · ${proPlan.price}`}
              </ButtonLink>
            </ProGate>
            <ProOnlyMessage>
              <p className="rounded-xl bg-white/80 px-4 py-3 text-sm font-semibold text-[var(--ink)]">
                Ya tienes Radar VPO PRO activo. Gestiónalo en{' '}
                <Link href="/account" className="underline">
                  Mi cuenta
                </Link>
                .
              </p>
            </ProOnlyMessage>
          </>
        }
      />

      <PublicSection>
        <div className="lp-section__head">
          <p className="lp-eyebrow">Qué incluye</p>
          <h2 id="pro-includes-title" className="lp-title">
            Solo lo que funciona hoy
          </h2>
        </div>
        <div className="lp-solution-grid">
          {proIncludes.map((item) => (
            <article key={item.title} className="lp-solution-card">
              <span className="lp-solution-card__step" aria-hidden="true">
                {item.icon}
              </span>
              <h3 className="lp-solution-card__title">{item.title}</h3>
              <p className="lp-solution-card__text">{item.description}</p>
            </article>
          ))}
        </div>
        {includedCourses.length > 0 ? (
          <ul className="mt-4 space-y-1 text-sm text-[var(--ink-soft)]">
            {includedCourses.map((course) => (
              <li key={course.id}>
                <Link href={`/cursos/${course.slug}`} className="font-semibold text-[var(--green-700)]">
                  {course.title}
                </Link>
                : {getCourseStatusSummary(course).statusText}.
              </li>
            ))}
          </ul>
        ) : null}
      </PublicSection>

      <PublicSection muted>
        <div className="lp-section__head">
          <p className="lp-eyebrow">Ejemplo</p>
          <h2 className="lp-title">Así es un aviso</h2>
          <p className="lp-lead">Ejemplo ilustrativo del formato; los datos son de muestra.</p>
        </div>
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          <article className="public-card p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">SMS</p>
            <p className="mt-2 rounded-xl bg-[var(--bg-app)] p-3 text-sm text-[var(--ink)]">
              Radar VPO PRO: nueva promoción publicada en [municipio]. [enlace]
            </p>
          </article>
          <article className="public-card p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Email</p>
            <p className="mt-2 rounded-xl bg-[var(--bg-app)] p-3 text-sm text-[var(--ink)]">
              Nueva promoción VPO publicada: [nombre de la promoción]. Puedes consultar el documento oficial de la
              promoción aquí: [enlace]
            </p>
          </article>
        </div>
      </PublicSection>

      <PublicSection>
        <ProComparison showCta />
      </PublicSection>

      <PublicSection muted>
        <div className="lp-section__head">
          <p className="lp-eyebrow">Límites</p>
          <h2 id="pro-limits-title" className="lp-title">
            Lo que PRO no hace
          </h2>
        </div>
        <ul className="mx-auto max-w-3xl list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--ink-soft)]">
          {proLimits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </PublicSection>

      <PublicSection border>
        <HomeFaq items={proFaqs} lead="Precio, cancelación y alcance de los avisos." />
        <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
          Consulta las{' '}
          <Link href="/condiciones" className="font-semibold text-[var(--green-700)]">
            condiciones de contratación
          </Link>{' '}
          antes de suscribirte.
        </p>
      </PublicSection>
    </PublicPage>
  );
}
