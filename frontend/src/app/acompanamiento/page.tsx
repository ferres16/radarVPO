'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SkeletonCard } from '@/components/skeleton-card';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { Stagger, StaggerItem } from '@/components/motion-primitives';
import { api } from '@/lib/api';
import type { Service } from '@/types';

const whatsappContactUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL ||
  'https://wa.me/34690763693?text=Hola%2C%20quiero%20activar%20el%20acompa%C3%B1amiento%20individualizado%20de%20Radar%20VPO.';

const whatsappConsultaUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_CONSULTA_URL ||
  'https://wa.me/34690763693?text=Hola%2C%20quiero%20enviar%20una%20consulta%20sobre%20acompa%C3%B1amiento%20individualizado%20de%20Radar%20VPO.';

const fallbackOfferings = [
  {
    eyebrow: '01 · Individualizado',
    title: 'Acompañamiento individualizado',
    copy:
      'Trabajamos tu caso de uno en uno: chat directo, revisión de tu situación y ayuda en cada paso hasta presentar la solicitud.',
    cta: 'Solicitar acompañamiento',
    href: whatsappContactUrl,
    price: null,
    salePrice: null,
    currency: 'EUR',
  },
  {
    eyebrow: '02 · Chat y seguimiento',
    title: 'Acceso a chat durante todo el proceso',
    copy:
      'Resolvemos dudas por chat cuando salen nuevas convocatorias, cambian plazos o necesitas validar documentación.',
    cta: 'Hablar por WhatsApp',
    href: whatsappContactUrl,
    price: null,
    salePrice: null,
    currency: 'EUR',
  },
  {
    eyebrow: '03 · Proceso completo',
    title: 'Ayuda de principio a fin',
    copy:
      'Desde detectar la oportunidad hasta preparar la solicitud: requisitos, papeles, plazos y revisión final.',
    cta: 'Empezar ahora',
    href: whatsappConsultaUrl,
    price: null,
    salePrice: null,
    currency: 'EUR',
  },
];

const benefits = [
  {
    title: 'Acompañamiento 1:1',
    copy: 'No es un curso genérico ni un boletín: te guiamos de forma individual según tu caso y tu municipio.',
  },
  {
    title: 'Acceso a chat',
    copy: 'Tienes canal directo para consultar dudas, enviar documentación y recibir orientación en el momento.',
  },
  {
    title: 'Proceso completo',
    copy: 'Te acompañamos en la vigilancia, la preparación y la presentación, no solo en un paso suelto.',
  },
];

const useCases = [
  'Quieres alguien que revise contigo requisitos y documentación antes de abrir el plazo.',
  'Necesitas un chat al que escribir cuando aparece una promoción relevante.',
  'Prefieres ir guiado de principio a fin, no improvisar en cada convocatoria.',
  'Buscas orientación personalizada sin depender solo de avisos automáticos.',
];

const faqs = [
  [
    '¿En qué se diferencia del VPO PRO?',
    'VPO PRO te avisa y te da el curso Guía VPO. El acompañamiento es individualizado: chat, revisión de tu caso y ayuda durante todo el proceso.',
  ],
  [
    '¿Tengo acceso a chat?',
    'Sí. El acompañamiento incluye canal directo para resolver dudas y validar pasos mientras avanza tu solicitud.',
  ],
  [
    '¿Esto garantiza conseguir una vivienda?',
    'No. Te acompañamos para llegar mejor preparado; la adjudicación depende siempre de los organismos oficiales.',
  ],
  [
    '¿Cómo contacto con el equipo?',
    'Puedes escribirnos por WhatsApp al 690 763 693 o por email desde esta página.',
  ],
];

const salePriceMarkerPattern = /\n?<!--rvpo:salePrice=([^>]*)-->/;

const getServiceSalePrice = (service: Service) => {
  if (service.salePrice) return service.salePrice;
  const match = service.description?.match(salePriceMarkerPattern);
  return match?.[1] || null;
};

const cleanServiceDescription = (description?: string | null) => {
  return (description || '').replace(salePriceMarkerPattern, '').trim();
};

const formatPrice = (price?: string | number | null, currency?: string | null) => {
  if (!price) return null;
  const amount = Number(price);
  if (!Number.isFinite(amount)) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const isOnSale = (salePrice?: string | number | null) => {
  if (!salePrice) return false;
  return Number(salePrice) > 0;
};

export default function AccompanimentPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const rows = await api.listServices();
        if (!active) return;
        setServices(rows.filter((service) => service.status === 'active'));
      } catch {
        if (!active) return;
        setServices([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const displayedOfferings =
    services.length > 0
      ? services.map((service, index) => ({
          eyebrow: `${String(index + 1).padStart(2, '0')} · ${service.name}`,
          title: service.name,
          copy:
            cleanServiceDescription(service.description) ||
            'Acompañamiento individualizado con chat y ayuda durante todo el proceso.',
          cta: service.stripePaymentLink ? 'Contratar acompañamiento' : 'Consultar acompañamiento',
          href: service.stripePaymentLink || whatsappContactUrl,
          price: service.price,
          salePrice: getServiceSalePrice(service),
          currency: service.currency,
        }))
      : fallbackOfferings;

  return (
    <main className="lp lp--inner lp--app">
      <section className="lp-page-hero">
        <div className="lp-page-hero__backdrop" aria-hidden="true" />
        <div className="shell lp-page-hero__inner">
          <span className="lp-hero__badge">Acompañamiento individualizado</span>
          <h1 className="lp-page-hero__title">
            Acompañamiento 1:1
            <span className="lp-hero__title-accent"> con chat y ayuda en todo el proceso</span>
          </h1>
          <p className="lp-page-hero__subtitle">
            Te guiamos de forma personalizada: acceso a chat, revisión de tu caso y seguimiento desde
            la detección de la oportunidad hasta la presentación de la solicitud.
          </p>
          <div className="lp-hero__actions lp-hero__actions--stack">
            <ButtonLink href={whatsappContactUrl} size="lg" block>
              Hablar por WhatsApp
            </ButtonLink>
            <ButtonLink href={whatsappConsultaUrl} variant="secondary" size="lg" block>
              Enviar consulta
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="shell space-y-4">
          <SectionHeader
            eyebrow="Qué incluye"
            title="Individualizado, con chat y de principio a fin"
            description="El foco no es un pack genérico: es alguien que te acompaña en tu proceso concreto."
          />
          <Stagger className="grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => (
              <StaggerItem key={benefit.title}>
                <SurfaceCard className="h-full p-5">
                  <h2 className="display-type text-2xl font-black text-[var(--ink)]">{benefit.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{benefit.copy}</p>
                </SurfaceCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {loading ? (
        <section className="lp-section">
          <div className="shell grid gap-4 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>
      ) : (
        <section className="lp-section">
          <div className="shell space-y-4">
            <SectionHeader
              eyebrow="Cómo te acompañamos"
              title="Tu caso, tu chat, tu proceso"
              description="Contrata acompañamiento individualizado o escríbenos para ver cómo encaja contigo."
            />
            <section className="grid gap-4 lg:grid-cols-3">
              {displayedOfferings.map((offering) => {
                const href = offering.href;
                const external = /^https?:\/\//.test(href);
                const onSale = isOnSale(offering.salePrice);
                const priceLabel = formatPrice(
                  onSale ? offering.salePrice : offering.price,
                  offering.currency,
                );
                const originalPriceLabel = onSale
                  ? formatPrice(offering.price, offering.currency)
                  : null;
                return (
                  <article key={offering.title} className="public-card public-card--hover p-5">
                    <p className="lp-eyebrow">{offering.eyebrow}</p>
                    {onSale ? (
                      <span className="mt-3 inline-flex rounded-full bg-[var(--green-700)] px-3 py-1 text-xs font-semibold text-white">
                        Oferta
                      </span>
                    ) : null}
                    <h2 className="mt-3 text-xl font-semibold text-[var(--ink)]">{offering.title}</h2>
                    {priceLabel ? (
                      <p className="mt-2 text-sm font-black text-[var(--ink)]">
                        {originalPriceLabel ? (
                          <span className="mr-2 text-[var(--ink-soft)] line-through">
                            {originalPriceLabel}
                          </span>
                        ) : null}
                        {priceLabel}
                      </p>
                    ) : null}
                    <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{offering.copy}</p>
                    {external ? (
                      <a
                        href={href}
                        className="btn btn--primary btn--block mt-5"
                        rel="noopener noreferrer"
                      >
                        {offering.cta}
                      </a>
                    ) : (
                      <Link href={href} className="btn btn--primary btn--block mt-5">
                        {offering.cta}
                      </Link>
                    )}
                  </article>
                );
              })}
            </section>
          </div>
        </section>
      )}

      <section className="lp-section lp-section--muted">
        <div className="shell grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <SurfaceCard className="p-5">
            <SectionHeader eyebrow="Para quién" title="Cuándo encaja el acompañamiento" />
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
              {useCases.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </SurfaceCard>
          <SurfaceCard className="p-5">
            <SectionHeader
              eyebrow="Proceso"
              title="Así te ayudamos de principio a fin"
              description="Chat activo y seguimiento continuo, no solo una consulta puntual."
            />
            <ol className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
              {[
                'Revisamos tu situación y requisitos.',
                'Te avisamos y orientamos cuando aparece una oportunidad relevante.',
                'Preparamos documentación y dudas por chat.',
                'Te acompañamos hasta presentar la solicitud con criterio.',
              ].map((step, index) => (
                <li
                  key={step}
                  className="rounded-2xl border border-[var(--stroke)] bg-white p-3 font-semibold text-[var(--ink)]"
                >
                  <span className="text-[var(--green-700)]">{String(index + 1).padStart(2, '0')} · </span>
                  {step}
                </li>
              ))}
            </ol>
          </SurfaceCard>
        </div>
      </section>

      <section className="lp-section lp-section--border">
        <div className="shell grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <SurfaceCard className="p-5">
            <SectionHeader eyebrow="FAQ" title="Dudas habituales" />
            <div className="mt-4 space-y-3">
              {faqs.map(([question, answer]) => (
                <details
                  key={question}
                  className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4"
                >
                  <summary className="cursor-pointer text-sm font-bold text-[var(--ink)]">
                    {question}
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{answer}</p>
                </details>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard id="hablemos" className="p-5">
            <SectionHeader
              eyebrow="Hablemos"
              title="Empieza tu acompañamiento"
              description="Escríbenos por WhatsApp al 690 763 693 y te orientamos sobre cómo trabajar tu caso."
            />
            <div className="mt-4 grid gap-2 sm:grid-cols-1">
              <ButtonLink href={whatsappContactUrl} block>
                Hablar por WhatsApp
              </ButtonLink>
              <ButtonLink href={whatsappConsultaUrl} variant="secondary" block>
                Enviar consulta
              </ButtonLink>
              <ButtonLink href="mailto:info@radarvpo.com" variant="secondary" block>
                Email
              </ButtonLink>
            </div>
          </SurfaceCard>
        </div>
      </section>
    </main>
  );
}
