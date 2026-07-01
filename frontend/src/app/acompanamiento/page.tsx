'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SkeletonCard } from '@/components/skeleton-card';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { Stagger, StaggerItem } from '@/components/motion-primitives';
import { AccompanimentHeroVisual } from '@/components/saas/hero-visuals';
import { api } from '@/lib/api';
import {
  accompanimentExcludes,
  accompanimentIncludes,
  accompanimentProblem,
  accompanimentSteps,
} from '@/lib/conversion';
import type { Service } from '@/types';

const whatsappContactUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL ||
  'https://wa.me/34600111222?text=Hola%2C%20quiero%20activar%20el%20acompa%C3%B1amiento%20personalizado%20de%20Radar%20VPO.';

const fallbackOfferings = [
  {
    eyebrow: '01 · Acompañamiento personalizado',
    title: 'Acompañamiento personalizado',
    copy:
      'Te acompañamos durante todo el proceso: vigilamos próximos lanzamientos, revisamos requisitos y te orientamos para aumentar tus posibilidades.',
    cta: 'Solicitar acompañamiento',
    href: whatsappContactUrl,
    price: null,
    salePrice: null,
    currency: 'EUR',
  },
  {
    eyebrow: '02 · Revisión y documentación',
    title: 'Revisión de requisitos y documentación',
    copy:
      'Revisamos tu caso, requisitos y documentación para que llegues preparado cuando se abra una solicitud.',
    cta: 'Pedir revisión',
    href: whatsappContactUrl,
    price: null,
    salePrice: null,
    currency: 'EUR',
  },
  {
    eyebrow: '03 · VPO PRO',
    title: 'Seguimiento de oportunidades con VPO PRO',
    copy:
      'Recibe avisos prioritarios cuando haya nuevos lanzamientos, promociones publicadas o cambios importantes.',
    cta: 'Activar VPO PRO',
    href: '/register?intent=pro',
    price: null,
    salePrice: null,
    currency: 'EUR',
  },
  {
    eyebrow: '04 · Formación',
    title: 'Cursos prácticos',
    copy:
      'Formación clara para entender requisitos, documentación, errores frecuentes y estrategias de inscripción.',
    cta: 'Ver cursos',
    href: '/cursos',
    price: null,
    salePrice: null,
    currency: 'EUR',
  },
];

const benefits = [
  {
    title: 'Seguimiento de oportunidades',
    copy: 'Monitorizamos lanzamientos y promociones para que no pierdas plazos ni señales relevantes.',
  },
  {
    title: 'Ayuda durante el proceso',
    copy: 'Traducimos requisitos, plazos y documentación en una ruta clara de actuación.',
  },
  {
    title: 'Orientación para aumentar posibilidades',
    copy: 'Te ayudamos a prepararte antes de que se abra la solicitud y a evitar errores costosos.',
  },
];

const useCases = [
  'No sabes si cumples requisitos económicos o familiares.',
  'Quieres enterarte de promociones y lanzamientos antes de que se saturen.',
  'Necesitas preparar documentación antes de abrirse una solicitud.',
  'Buscas orientación personalizada sin improvisar en cada paso.',
];

const faqs = [
  ['¿Esto garantiza conseguir una vivienda?', 'No. Te acompañamos para detectar oportunidades, entender requisitos y presentar mejor tu candidatura.'],
  ['¿Puedo empezar solo con cursos?', 'Sí. Los cursos son la vía más ligera para ganar criterio antes de contratar acompañamiento.'],
  ['¿Cómo contacto con el equipo?', 'WhatsApp, email, formulario y reserva de llamada están disponibles en esta página.'],
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

  const displayedOfferings = services.length > 0
    ? services.map((service, index) => ({
        eyebrow: `${String(index + 1).padStart(2, '0')} · ${service.name}`,
        title: service.name,
        copy: cleanServiceDescription(service.description) || 'Acompañamiento personalizado de Radar VPO.',
        cta: service.stripePaymentLink ? 'Contratar acompañamiento' : 'Consultar acompañamiento',
        href: service.stripePaymentLink || whatsappContactUrl,
        price: service.price,
        salePrice: getServiceSalePrice(service),
        currency: service.currency,
      }))
    : fallbackOfferings;

  return (
    <main className="lp lp--inner lp--app">
      <section className="lp-page-hero lp-page-hero--split">
        <div className="lp-page-hero__backdrop" aria-hidden="true" />
        <div className="shell">
          <div className="page-hero-split">
            <div className="page-hero-split__copy">
              <span className="lp-hero__badge">Acompañamiento VPO</span>
              <h1 className="lp-page-hero__title">
                Llega preparado
                <span className="lp-hero__title-accent"> con acompañamiento humano</span>
              </h1>
              <p className="lp-page-hero__subtitle">
                Revisamos requisitos, documentación y plazos contigo. Sin garantizar adjudicación, sí maximizar tu preparación.
              </p>
              <ul className="lp-hero__proof lp-hero__proof--compact" aria-label="Beneficios">
                <li><span className="lp-hero__proof-mark" aria-hidden="true" />Revisión personalizada de tu caso</li>
                <li><span className="lp-hero__proof-mark" aria-hidden="true" />Seguimiento de oportunidades</li>
                <li><span className="lp-hero__proof-mark" aria-hidden="true" />Respuesta rápida por WhatsApp</li>
              </ul>
              <div className="lp-hero__actions lp-hero__actions--stack">
                <ButtonLink href={whatsappContactUrl} size="lg" block>
                  Hablar por WhatsApp
                </ButtonLink>
                <ButtonLink href="#hablemos" variant="secondary" size="lg" block>
                  Enviar consulta
                </ButtonLink>
              </div>
            </div>
            <div className="page-hero-split__visual order-first md:order-none">
              <AccompanimentHeroVisual />
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="shell">
          <div className="lp-section__head">
            <p className="lp-eyebrow">El problema</p>
            <h2 className="lp-title">{accompanimentProblem.title}</h2>
            <p className="lp-lead">{accompanimentProblem.description}</p>
          </div>
        </div>
      </section>

      <section className="lp-section lp-section--muted">
        <div className="shell space-y-4">
          <SectionHeader eyebrow="Qué hacemos" title="Te ayudamos si…" />
          <Stagger className="grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => (
              <StaggerItem key={benefit.title}>
                <SurfaceCard className="h-full p-5">
                  <h2 className="text-lg font-bold text-[var(--ink)]">{benefit.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{benefit.copy}</p>
                </SurfaceCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="lp-section">
        <div className="shell">
          <SectionHeader eyebrow="Proceso" title="Cómo funciona en 3 pasos" />
          <Stagger className="how-steps mt-4">
            {accompanimentSteps.map((step) => (
              <StaggerItem key={step.step}>
                <article className="how-step-card">
                  <span className="how-step-card__num">{step.step}</span>
                  <h3 className="how-step-card__title">{step.title}</h3>
                  <p className="how-step-card__text">{step.description}</p>
                </article>
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
            eyebrow="Modalidades"
            title="Elige el nivel de acompañamiento que necesitas"
            description="Formación para aprender, alertas para vigilar y acompañamiento 1:1 para ir guiado."
          />
          <section className="grid gap-4 lg:grid-cols-3">
            {displayedOfferings.map((offering) => {
              const href = offering.href;
              const external = /^https?:\/\//.test(href);
              const onSale = isOnSale(offering.salePrice);
              const priceLabel = formatPrice(onSale ? offering.salePrice : offering.price, offering.currency);
              const originalPriceLabel = onSale ? formatPrice(offering.price, offering.currency) : null;
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
                      {originalPriceLabel ? <span className="mr-2 text-[var(--ink-soft)] line-through">{originalPriceLabel}</span> : null}
                      {priceLabel}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{offering.copy}</p>
                  {external ? (
                    <a href={href} className="btn btn--primary btn--block mt-5" rel="noopener noreferrer">
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
        <div className="shell grid gap-4 lg:grid-cols-2">
          <SurfaceCard className="p-5">
            <SectionHeader eyebrow="Para quién es" title="Te ayudamos si…" />
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
              {useCases.map((item) => (
                <li key={item} className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">{item}</li>
              ))}
            </ul>
          </SurfaceCard>
          <SurfaceCard className="p-5">
            <SectionHeader eyebrow="Qué incluye" title="Revisamos requisitos, documentación y plazos" />
            <ul className="mt-4 space-y-2 text-sm text-[var(--ink-soft)]">
              {accompanimentIncludes.map((item) => (
                <li key={item} className="flex gap-2"><span className="text-[var(--green-700)]">✓</span>{item}</li>
              ))}
            </ul>
            <div className="mt-5 border-t border-[var(--stroke)] pt-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Qué no incluye</p>
              <ul className="mt-2 space-y-2 text-sm text-[var(--ink-soft)]">
                {accompanimentExcludes.map((item) => (
                  <li key={item} className="flex gap-2"><span>—</span>{item}</li>
                ))}
              </ul>
            </div>
          </SurfaceCard>
        </div>
      </section>

      <section className="lp-section lp-section--border">
        <div className="shell grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <SurfaceCard className="p-5">
          <SectionHeader eyebrow="FAQ" title="Dudas habituales" />
          <div className="mt-4 space-y-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
                <summary className="cursor-pointer text-sm font-bold text-[var(--ink)]">{question}</summary>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{answer}</p>
              </details>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard id="hablemos" className="p-5">
          <SectionHeader eyebrow="Hablemos" title="Cuéntanos qué necesitas" description="Contacto integrado: formulario, WhatsApp, email y reserva de llamada." />
          <form action="mailto:info@radarvpo.com" method="post" encType="text/plain" className="mt-4 space-y-3">
            <input name="nombre" className="ds-control w-full" placeholder="Nombre" />
            <input name="email" type="email" className="ds-control w-full" placeholder="Email" />
            <textarea name="mensaje" className="ds-control min-h-28 w-full" placeholder="Explícanos tu caso" />
            <button type="submit" className="btn btn--primary btn--lg btn--block">Enviar consulta</button>
          </form>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <ButtonLink href={whatsappContactUrl} block>WhatsApp</ButtonLink>
            <ButtonLink href="mailto:info@radarvpo.com" variant="secondary" block>Email</ButtonLink>
            <ButtonLink href={whatsappContactUrl} variant="secondary" block>Reservar llamada</ButtonLink>
          </div>
        </SurfaceCard>
        </div>
      </section>

      <section className="lp-section lp-section--muted">
        <div className="shell">
          <div className="public-cta-band">
            <div>
              <h2 className="lp-title lp-title--sm">¿Listo para hablar con el equipo?</h2>
              <p className="lp-lead">Cuéntanos tu caso por WhatsApp y te orientamos sobre el siguiente paso.</p>
            </div>
            <div className="public-cta-band__actions lp-hero__actions--stack">
              <ButtonLink href={whatsappContactUrl} size="lg" block>
                Hablar por WhatsApp
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
