import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { TrackedButtonLink } from '@/components/tracked-link';
import { HomeFaq } from '@/components/conversion/home-faq';
import { NotifyPreview } from '@/components/conversion/notify-preview';
import { PageViewTracker } from '@/components/conversion/page-view-tracker';
import { ProofStats } from '@/components/conversion/proof-stats';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { SpaceDemo } from '@/components/conversion/space-demo';
import { ProGate, ProOnlyMessage } from '@/components/pro/pro-cta';
import { ProComparison } from '@/components/pro-comparison';
import { StructuredData } from '@/components/structured-data';
import { buildProofItems } from '@/lib/catalog-stats';
import { getCourseStatusSummary, isIncludedInPro } from '@/lib/offer';
import { publicPublishedPromotions, uniqueMunicipalities } from '@/lib/public-promotions';
import { proFaqs, proForWhom, proIncludes, proLimits, proPlan, proWhyPay } from '@/lib/pro';
import { breadcrumbJsonLd, createMetadata, faqJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Radar VPO PRO: avisos por SMS y organización de tus solicitudes',
  description: `Suscripción mensual (${proPlan.price}) con avisos por email y SMS, Mi espacio sin límite y el curso inicial mientras esté activa. Cancela cuando quieras.`,
  path: '/pro',
  keywords: ['alertas vivienda protegida', 'avisos VPO', 'suscripción VPO'],
});

export default async function ProPage() {
  const [courses, promotions, stats] = await Promise.all([
    api.listCourses().catch(() => []),
    api.getPromotions('?limit=50').catch(() => []),
    api.getCatalogStats().catch(() => null),
  ]);
  const includedCourses = courses.filter(isIncludedInPro);
  const listed = publicPublishedPromotions(promotions);
  const sample = listed[0];
  const proofItems = buildProofItems(stats, {
    published: listed.length,
    municipalities: uniqueMunicipalities(listed).length,
  });

  return (
    <PublicPage>
      <PageViewTracker event="pro_page_viewed" />
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
        titleAccent="SMS, espacio y curso inicial"
        description={`${proPlan.price}, con renovación mensual. Consultar PDF es gratis. PRO es para quien quiere el aviso en el móvil y seguir varias convocatorias en su cuenta. Cancelas cuando quieras.`}
        actions={
          <>
            <ProGate>
              <TrackedButtonLink
                href={proPlan.checkoutHref}
                size="lg"
                block
                event="pro_cta_clicked"
                eventProperties={{ source: 'pro_hero' }}
              >
                {`${proPlan.ctaLabel} · ${proPlan.price}`}
              </TrackedButtonLink>
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
        footer={<ProofStats items={proofItems} />}
      />

      <PublicSection>
        <div className="lp-section__head">
          <p className="lp-eyebrow">Por qué pagar</p>
          <h2 className="lp-title">Hay avisos y guías gratis. PRO añade otra cosa</h2>
          <p className="lp-lead">
            No cobramos por consultar convocatorias. PRO cubre el aviso en el móvil, la organización con cuenta y el
            curso inicial mientras esté activa.
          </p>
        </div>
        <div className="lp-why-grid">
          {proWhyPay.map((item) => (
            <article key={item.title} className="lp-why-card">
              <h3 className="lp-why-card__title">{item.title}</h3>
              <p className="lp-why-card__text">{item.body}</p>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection muted>
        <div className="lp-section__head">
          <p className="lp-eyebrow">Qué incluye</p>
          <h2 id="pro-includes-title" className="lp-title">
            Solo lo que funciona hoy
          </h2>
        </div>
        <div className="lp-why-grid">
          {proIncludes.map((item) => (
            <article key={item.title} className="lp-why-card">
              <h3 className="lp-why-card__title">{item.title}</h3>
              <p className="lp-why-card__text">{item.description}</p>
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

      <PublicSection>
        <div className="lp-hero__split">
          <div>
            <p className="lp-eyebrow">Demostración</p>
            <h2 className="lp-title">Así llega un aviso</h2>
            {sample ? (
              <p className="lp-lead">
                Texto real del sistema para una promoción publicada ahora. El envío depende de las fuentes que
                monitorizamos.
              </p>
            ) : (
              <p className="lp-lead">
                Cuando se publique una promoción, el SMS incluye el municipio y el enlace a su ficha. No mostramos un
                ejemplo inventado.
              </p>
            )}
            {sample ? <div className="mt-4"><NotifyPreview promotion={sample} /></div> : null}
          </div>
          {sample ? <SpaceDemo promotion={sample} /> : null}
        </div>
      </PublicSection>

      <PublicSection muted>
        <div className="lp-hero__split">
          <div>
            <p className="lp-eyebrow">Para quién</p>
            <h2 className="lp-title">Cuándo tiene sentido y cuándo no</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--ink)]">
              {proForWhom.yes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green-700)]" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="lp-eyebrow">No es para</p>
            <h2 className="lp-title lp-title--sm">Mejor quédate en gratis si…</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--ink-soft)]">
              {proForWhom.no.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
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
