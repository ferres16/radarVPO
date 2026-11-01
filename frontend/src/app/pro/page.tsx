import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CheckoutPanel } from '@/components/checkout/checkout-panel';
import { TrackedButtonLink } from '@/components/tracked-link';
import { HomeFaq } from '@/components/conversion/home-faq';
import { NotifyPreview } from '@/components/conversion/notify-preview';
import { PageViewTracker } from '@/components/conversion/page-view-tracker';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { SpaceDemo } from '@/components/conversion/space-demo';
import { ProGate, ProOnlyMessage } from '@/components/pro/pro-cta';
import { ProComparison } from '@/components/pro-comparison';
import { StructuredData } from '@/components/structured-data';
import { ButtonLink } from '@/components/design-system';
import { getCourseStatusSummary, isIncludedInPro } from '@/lib/offer';
import { publicCatalogCourses } from '@/lib/public-courses';
import { publicPublishedPromotions } from '@/lib/public-promotions';
import {
  proFaqs,
  proForWhom,
  proIncludedGuidesCopy,
  proIncludes,
  proLimits,
  proPlan,
  proWhyPay,
} from '@/lib/pro';
import { breadcrumbJsonLd, createMetadata, faqJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Radar VPO PRO: avisos de vivienda protegida',
  description: `Recibe avisos de vivienda protegida sin revisar las webs cada día. ${proPlan.priceShort} al mes, renovación automática, cancelación cuando quieras.`,
  path: '/pro',
  keywords: ['alertas vivienda protegida', 'avisos VPO', 'suscripción VPO'],
});

const PRO_STEPS = [
  {
    step: '1',
    title: 'Te suscribes',
    text: `${proPlan.priceShort}/mes. Renovación automática; cancelas desde Mi cuenta cuando quieras.`,
  },
  {
    step: '2',
    title: 'Te avisamos',
    text: 'Email (y SMS si activas el móvil) cuando detectamos una promoción publicada o un próximo lanzamiento.',
  },
  {
    step: '3',
    title: 'Organizas lo que sigues',
    text: 'Mi espacio sin límite: checklist, etapa y notas en cualquier dispositivo.',
  },
] as const;

export default async function ProPage({
  searchParams,
}: {
  searchParams?: Promise<{ canceled?: string }>;
}) {
  const [courses, promotions] = await Promise.all([
    api.listCourses().catch(() => []),
    api.getPromotions('?limit=100').catch(() => []),
  ]);
  const canceled = (await searchParams)?.canceled === '1';
  const includedCourses = publicCatalogCourses(courses).filter(isIncludedInPro);
  const includedGuides = proIncludedGuidesCopy(includedCourses.map((course) => course.title));
  const listed = publicPublishedPromotions(promotions);
  const sample = listed[0];
  const includeBullets = [
    'Avisos por email de todas las promociones detectadas',
    'SMS si activas tu móvil',
    'Mi espacio sin límite',
    'Cancelas cuando quieras; acceso hasta fin de periodo pagado',
    ...(includedGuides ? [includedGuides.title] : []),
  ];

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
        animated={false}
        badge={`${proPlan.priceShort} / mes · cancelas cuando quieras`}
        title="Avisos de vivienda protegida"
        titleAccent="sin revisar diez webs cada día"
        description="PRO te avisa por email y SMS cuando detectamos una convocatoria, y te deja organizar en Mi espacio todo lo que sigues. Consultar los PDF oficiales sigue siendo gratis."
        actions={
          <>
            <ProGate>
              <TrackedButtonLink
                href="#pagar"
                size="lg"
                block
                event="pro_cta_clicked"
                eventProperties={{ source: 'pro_hero' }}
              >
                {`Empezar PRO · ${proPlan.priceShort}/mes`}
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
            <ButtonLink href="#como-funciona" variant="secondary" size="lg" block>
              Cómo funciona
            </ButtonLink>
          </>
        }
        footer={
          <ul className="lp-hero__proof" aria-label="Resumen PRO">
            <li>
              <span className="lp-hero__proof-mark" aria-hidden>
                ✓
              </span>
              Email + SMS
            </li>
            <li>
              <span className="lp-hero__proof-mark" aria-hidden>
                ✓
              </span>
              Todos los avisos detectados
            </li>
            <li>
              <span className="lp-hero__proof-mark" aria-hidden>
                ✓
              </span>
              Sin permanencia
            </li>
          </ul>
        }
      />

      <PublicSection id="como-funciona">
        <div className="lp-section__head">
          <p className="lp-eyebrow">Cómo funciona</p>
          <h2 className="lp-title">Tres pasos, sin letra pequeña inventada</h2>
          <p className="lp-lead">
            Pagas la suscripción, recibes avisos de lo que detectamos y organizas las oportunidades en tu cuenta.
          </p>
        </div>
        <div className="lp-why-grid">
          {PRO_STEPS.map((item) => (
            <article key={item.step} className="lp-why-card">
              <p className="lp-offer-card__eyebrow">Paso {item.step}</p>
              <h3 className="lp-why-card__title">{item.title}</h3>
              <p className="lp-why-card__text">{item.text}</p>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection muted>
        <div className="lp-section__head">
          <p className="lp-eyebrow">Por qué PRO</p>
          <h2 className="lp-title">Menos vigilancia manual</h2>
          <p className="lp-lead">
            Consultar convocatorias es gratis. PRO cubre el aviso a tiempo y la organización con cuenta.
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

      <PublicSection>
        <div className="lp-section__head">
          <p className="lp-eyebrow">Qué incluye</p>
          <h2 className="lp-title">La oferta de hoy</h2>
          <p className="lp-lead">
            {includedGuides
              ? 'Avisos, espacio y la guía listada más abajo. Nada inventado.'
              : 'Avisos y espacio. Si una guía pasa a estar incluida en PRO, aparecerá aquí con nombre y enlace.'}
          </p>
        </div>
        <div className="lp-why-grid">
          {proIncludes.map((item) => (
            <article key={item.title} className="lp-why-card">
              <h3 className="lp-why-card__title">{item.title}</h3>
              <p className="lp-why-card__text">{item.description}</p>
            </article>
          ))}
          {includedGuides ? (
            <article className="lp-why-card">
              <h3 className="lp-why-card__title">{includedGuides.title}</h3>
              <p className="lp-why-card__text">{includedGuides.description}</p>
            </article>
          ) : null}
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
        <div className="lp-hero__split">
          <div>
            <p className="lp-eyebrow">Ejemplo real</p>
            <h2 className="lp-title">Así llega un aviso</h2>
            {sample ? (
              <p className="lp-lead">
                Texto del sistema para una promoción publicada ahora. El envío depende de las fuentes que
                monitorizamos.
              </p>
            ) : (
              <p className="lp-lead">
                Cuando se publique una promoción, el SMS incluye el municipio y el enlace a su ficha.
              </p>
            )}
            {sample ? (
              <div className="mt-4">
                <NotifyPreview promotion={sample} />
              </div>
            ) : null}
          </div>
          {sample ? <SpaceDemo promotion={sample} /> : null}
        </div>
      </PublicSection>

      <PublicSection>
        <ProComparison showCta={false} />
      </PublicSection>

      <PublicSection muted id="pagar">
        <div className="lp-section__head">
          <p className="lp-eyebrow">Suscripción</p>
          <h2 className="lp-title">{`${proPlan.priceShort} al mes`}</h2>
          <p className="lp-lead">
            Precio final. Renovación automática. Cancelas desde Mi cuenta y conservas el acceso hasta el final del
            periodo ya pagado.
          </p>
        </div>
        <ProGate>
          <div className="mx-auto max-w-lg scroll-mt-24">
            <CheckoutPanel
              layout="embedded"
              canceled={canceled}
              summary={{
                product: 'pro',
                title: proPlan.name,
                priceLabel: proPlan.priceShort,
                cadenceLabel: 'al mes',
                recurrenceNote:
                  'Renovación mensual. Cancelas desde Mi cuenta y conservas el acceso hasta el final del periodo pagado.',
                bullets: includeBullets,
                backHref: '/',
                backLabel: 'Volver al inicio',
              }}
            />
          </div>
        </ProGate>
        <ProOnlyMessage>
          <p className="mx-auto mt-4 max-w-lg rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-[var(--ink)]">
            Ya tienes PRO. Ve a{' '}
            <Link href="/account" className="underline">
              Mi cuenta
            </Link>{' '}
            para gestionar la suscripción.
          </p>
        </ProOnlyMessage>
      </PublicSection>

      <PublicSection>
        <div className="lp-hero__split">
          <div>
            <p className="lp-eyebrow">Para quién</p>
            <h2 className="lp-title">Cuándo tiene sentido</h2>
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
            <p className="lp-eyebrow">Mejor gratis si…</p>
            <h2 className="lp-title lp-title--sm">No hace falta PRO</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--ink-soft)]">
              {proForWhom.no.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-[var(--ink-soft)]">
              También puedes comprar la{' '}
              <Link href="/cursos/guiav1#pagar" className="font-semibold text-[var(--green-700)]">
                guía
              </Link>{' '}
              por separado (pago único).
            </p>
          </div>
        </div>
      </PublicSection>

      <PublicSection muted>
        <div className="lp-section__head">
          <p className="lp-eyebrow">Límites</p>
          <h2 className="lp-title">Lo que PRO no hace</h2>
        </div>
        <ul className="mx-auto max-w-3xl list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--ink-soft)]">
          {proLimits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </PublicSection>

      <PublicSection border>
        <HomeFaq items={proFaqs} lead="Precio, cancelación, inclusiones y alcance de los avisos." />
        <div className="public-cta-band mt-8">
          <div>
            <h2 className="lp-title lp-title--sm">¿Listo para los avisos?</h2>
            <p className="lp-lead">
              {proPlan.priceShort}/mes. Sin permanencia. Cancelas cuando quieras desde Mi cuenta.
            </p>
          </div>
          <div className="public-cta-band__actions">
            <ProGate>
              <TrackedButtonLink
                href="#pagar"
                size="lg"
                block
                event="pro_cta_clicked"
                eventProperties={{ source: 'pro_footer' }}
              >
                {`Empezar · ${proPlan.priceShort}/mes`}
              </TrackedButtonLink>
            </ProGate>
            <p className="text-center text-xs text-[var(--ink-soft)]">
              Condiciones en{' '}
              <Link href="/condiciones" className="underline">
                /condiciones
              </Link>
              .
            </p>
          </div>
        </div>
      </PublicSection>
    </PublicPage>
  );
}
