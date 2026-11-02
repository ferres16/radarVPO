import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CheckoutPanel } from '@/components/checkout/checkout-panel';
import { TrackedButtonLink } from '@/components/tracked-link';
import { HomeFaq } from '@/components/conversion/home-faq';
import { NotifyPreview } from '@/components/conversion/notify-preview';
import { PageViewTracker } from '@/components/conversion/page-view-tracker';
import { PublicPage, PublicSection } from '@/components/conversion/public-shell';
import { ProGate, ProOnlyMessage } from '@/components/pro/pro-cta';
import { ProStickyCta } from '@/components/pro/pro-sticky-cta';
import { ProComparison } from '@/components/pro-comparison';
import { StructuredData } from '@/components/structured-data';
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
import { getProWhatsappHref, proWhatsapp } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Radar VPO PRO: alertas y WhatsApp para consultas',
  description: `Suscripción Radar VPO PRO: alertas de vivienda protegida en Catalunya, SMS y WhatsApp para consultas. ${proPlan.priceShort} al mes, cancelas cuando quieras.`,
  path: '/pro',
  image: proPlan.productImageSrc,
  keywords: [
    'alertas vivienda protegida',
    'avisos VPO',
    'WhatsApp VPO',
    'suscripción VPO',
    'Radar VPO PRO',
  ],
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
    text: 'Email y SMS cuando detectamos una promoción publicada o un próximo lanzamiento.',
  },
  {
    step: '3',
    title: 'Consultas por WhatsApp',
    text: 'Canal directo para dudas del proceso mientras tu suscripción esté activa.',
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
    'SMS al móvil que indiques',
    'WhatsApp para consultas',
    'Cancelas cuando quieras; acceso hasta fin de periodo pagado',
    ...(includedGuides ? [includedGuides.title] : []),
  ];
  const whatsappHref = getProWhatsappHref(
    'Hola, soy suscriptor/a de Radar VPO PRO y tengo una consulta.',
  );

  return (
    <PublicPage className="pb-24 md:pb-0">
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
      <ProStickyCta />

      <header className="lp-page-hero lp-page-hero--flush">
        <div className="shell grid gap-5 py-4 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:items-start md:gap-8 md:py-5">
          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--stroke)] bg-[#f4efe6]">
            <Image
              src={proPlan.productImageSrc}
              alt={proPlan.productImageAlt}
              width={1024}
              height={1536}
              priority
              className="h-auto w-full object-contain"
              sizes="(max-width: 768px) 100vw, 352px"
            />
          </div>

          <div className="grid min-w-0 gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--green-700)] md:text-[11px]">
                Suscripción Radar VPO
              </p>
              <h1 className="display-type mt-1 text-2xl font-black text-[var(--ink)] sm:mt-2 sm:text-3xl md:text-4xl">
                {proPlan.name}
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] md:text-base">
                Recibe alertas de nuevas promociones de vivienda protegida en Catalunya y resuelve dudas por WhatsApp.
                Sigue las novedades. Prepara tu próximo paso.
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-[var(--ink)]">
                {proPlan.priceShort}/mes · email + SMS · WhatsApp para consultas · sin permanencia
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                <span className="rounded-full bg-[var(--bg-app)] px-3 py-1">Alertas email + SMS</span>
                <span className="rounded-full bg-[rgba(37,211,102,0.14)] px-3 py-1 text-[#0f766e]">
                  WhatsApp consultas
                </span>
                <span className="rounded-full bg-[var(--bg-app)] px-3 py-1">Cancelas cuando quieras</span>
              </div>
            </div>

            <aside id="pagar" className="scroll-mt-24">
              <ProGate>
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
              </ProGate>
              <ProOnlyMessage>
                <div className="space-y-3 rounded-2xl border border-[var(--stroke)] bg-white px-4 py-4 text-sm font-semibold text-[var(--ink)]">
                  <p>
                    Ya tienes Radar VPO PRO activo. Gestiónalo en{' '}
                    <Link href="/account" className="underline">
                      Mi cuenta
                    </Link>
                    .
                  </p>
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--primary btn--lg btn--block"
                    >
                      Abrir WhatsApp de consultas
                    </a>
                  ) : null}
                </div>
              </ProOnlyMessage>
              <p className="mt-3 text-xs leading-5 text-[var(--ink-soft)]">
                Precio final. Sin permanencia. Condiciones en{' '}
                <Link href="/condiciones" className="underline">
                  /condiciones
                </Link>
                .
              </p>
            </aside>
          </div>
        </div>
      </header>

      <PublicSection id="incluye">
        <div className="lp-section__head">
          <p className="lp-eyebrow">El producto</p>
          <h2 className="lp-title">Qué incluye Radar VPO PRO</h2>
          <p className="lp-lead">
            Alertas a tiempo y un canal de consultas. Consultar las convocatorias sigue siendo gratis.
          </p>
        </div>
        <div className="lp-why-grid">
          {proIncludes.map((item) => (
            <article
              key={item.title}
              className={`lp-why-card${item.title.includes('WhatsApp') ? ' lp-why-card--highlight' : ''}`}
            >
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

      <PublicSection muted id="whatsapp">
        <div className="lp-hero__split">
          <div>
            <p className="lp-eyebrow">Diferencial</p>
            <h2 className="lp-title">WhatsApp para consultas</h2>
            <p className="lp-lead">
              Cuando te llega un aviso o no sabes el siguiente paso, escribes por WhatsApp. Orientación sobre el
              proceso y las promociones mientras tu PRO esté activo.
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--ink)]">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green-700)]" aria-hidden />
                <span>Dudas sobre registro, plazos y documentación habitual</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green-700)]" aria-hidden />
                <span>Aclarar qué significa un aviso o una ficha concreta</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ink-soft)]" aria-hidden />
                <span>No presentamos tu solicitud ni damos asesoramiento jurídico 1:1 formal</span>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <ProGate>
                <TrackedButtonLink
                  href="#pagar"
                  size="lg"
                  event="pro_cta_clicked"
                  eventProperties={{ source: 'pro_whatsapp' }}
                >
                  Activar PRO y WhatsApp
                </TrackedButtonLink>
              </ProGate>
              <ProOnlyMessage>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary btn--lg"
                  >
                    Escribir por WhatsApp
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    El enlace de WhatsApp se activa en tu cuenta PRO.
                  </p>
                )}
              </ProOnlyMessage>
            </div>
            {!proWhatsapp.available ? (
              <p className="mt-3 text-xs text-[var(--ink-soft)]">
                Tras activar PRO verás el acceso a WhatsApp en Mi cuenta.
              </p>
            ) : null}
          </div>
          <aside className="lp-whatsapp-card" aria-label="Acceso a WhatsApp">
            <p className="lp-whatsapp-card__kicker">Incluido en PRO</p>
            <p className="lp-whatsapp-card__title">Acceso a WhatsApp</p>
            <p className="lp-whatsapp-card__text">para consultas</p>
            <p className="lp-whatsapp-card__note">Disponible mientras la suscripción esté activa.</p>
          </aside>
        </div>
      </PublicSection>

      <PublicSection id="como-funciona">
        <div className="lp-section__head">
          <p className="lp-eyebrow">Cómo funciona</p>
          <h2 className="lp-title">Tres pasos claros</h2>
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
        <div className="mt-6 flex justify-center">
          <ProGate>
            <TrackedButtonLink
              href="#pagar"
              size="lg"
              event="pro_cta_clicked"
              eventProperties={{ source: 'pro_steps' }}
            >
              {`Empezar ahora · ${proPlan.priceShort}/mes`}
            </TrackedButtonLink>
          </ProGate>
        </div>
      </PublicSection>

      <PublicSection muted>
        <div className="lp-section__head">
          <p className="lp-eyebrow">Por qué PRO</p>
          <h2 className="lp-title">Menos vigilancia manual</h2>
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

      {sample ? (
        <PublicSection>
          <div className="lp-section__head">
            <p className="lp-eyebrow">Ejemplo real</p>
            <h2 className="lp-title">Así llega un aviso</h2>
            <p className="lp-lead">
              Texto del sistema para una promoción publicada. El envío depende de las fuentes que monitorizamos.
            </p>
          </div>
          <NotifyPreview promotion={sample} />
          <div className="mt-6 flex justify-center">
            <ProGate>
              <TrackedButtonLink
                href="#pagar"
                size="lg"
                event="pro_cta_clicked"
                eventProperties={{ source: 'pro_notify_preview' }}
              >
                Quiero recibir avisos
              </TrackedButtonLink>
            </ProGate>
          </div>
        </PublicSection>
      ) : null}

      <PublicSection muted>
        <ProComparison showCta />
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
        <HomeFaq items={proFaqs} lead="Precio, cancelación, WhatsApp y alcance de los avisos." />
        <div className="public-cta-band mt-8">
          <div>
            <h2 className="lp-title lp-title--sm">Sigue las novedades. Prepara tu próximo paso.</h2>
            <p className="lp-lead">
              {proPlan.priceShort}/mes. Alertas + WhatsApp. Sin permanencia.
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
                {`Volver al pago · ${proPlan.priceShort}/mes`}
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
