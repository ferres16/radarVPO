'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SkeletonCard } from '@/components/skeleton-card';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { Stagger, StaggerItem } from '@/components/motion-primitives';
import { api } from '@/lib/api';
import type { Service } from '@/types';

const whatsappContactUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL ||
  'https://wa.me/34600111222?text=Hola%2C%20quiero%20activar%20el%20seguimiento%20individualizado%20de%20Radar%20VPO.';

const fallbackServices = [
  {
    eyebrow: '01 · Seguimiento personalizado',
    title: 'Seguimiento personalizado',
    copy:
      'Vigilamos promociones, avisos y fechas clave para que sepas cuándo actuar y qué preparar.',
    cta: 'Activar seguimiento',
    href: whatsappContactUrl,
    accent: 'from-cyan-50 to-white',
  },
  {
    eyebrow: '02 · Asesorías 1:1',
    title: 'Asesorías 1:1',
    copy:
      'Revisamos tu caso, requisitos y documentación para ayudarte a presentarte con más seguridad.',
    cta: 'Pedir asesoría',
    href: whatsappContactUrl,
    accent: 'from-emerald-50 to-white',
  },
  {
    eyebrow: '03 · Alertas Pro',
    title: 'Alertas Pro por WhatsApp',
    copy:
      'Recibe avisos prioritarios por WhatsApp cuando haya nuevas oportunidades o cambios importantes.',
    cta: 'Activar alertas',
    href: whatsappContactUrl,
    accent: 'from-white to-cyan-50',
  },
  {
    eyebrow: '04 · Cursos',
    title: 'Cursos prácticos',
    copy:
      'Formación clara para entender requisitos, documentación, errores frecuentes y estrategias de inscripción.',
    cta: 'Ver cursos',
    href: '/cursos',
    accent: 'from-emerald-50 to-cyan-50',
  },
];

const benefits = [
  {
    title: 'Vigilamos oportunidades por ti',
    copy: 'Reducimos el tiempo que pierdes revisando portales, boletines y páginas municipales.',
  },
  {
    title: 'Te ayudamos a decidir rápido',
    copy: 'Traducimos requisitos, plazos y documentación a una ruta clara de actuación.',
  },
  {
    title: 'Evitas errores caros',
    copy: 'Una solicitud incompleta o fuera de plazo puede dejarte fuera. Nuestro foco es prevenirlo.',
  },
];

const useCases = [
  'No sabes si cumples requisitos económicos o familiares.',
  'Quieres enterarte de nuevas promociones antes de que se saturen.',
  'Necesitas preparar documentación antes de abrirse una solicitud.',
  'Quieres aprender el proceso sin pagar una asesoría completa.',
];

const faqs = [
  ['¿Esto garantiza conseguir una vivienda?', 'No. Te ayudamos a detectar oportunidades, entender requisitos y presentar mejor tu candidatura.'],
  ['¿Puedo empezar solo con cursos?', 'Sí. Los cursos son la vía más ligera para ganar criterio antes de contratar seguimiento.'],
  ['¿El contacto está integrado aquí?', 'Sí. WhatsApp, email, formulario y reserva de llamada viven en esta página.'],
];

export default function ServicesPage() {
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

  const displayedServices = services.length > 0
    ? services.map((service, index) => ({
        eyebrow: `${String(index + 1).padStart(2, '0')} · ${service.name}`,
        title: service.name,
        copy: service.description || 'Servicio personalizado de Radar VPO.',
        cta: service.stripePaymentLink ? 'Contratar servicio' : 'Consultar servicio',
        href: service.stripePaymentLink || whatsappContactUrl,
      }))
    : fallbackServices;

  return (
    <main className="shell space-y-8 pb-16">
      <PageHero
        eyebrow="Servicios Premium"
        title="Acompañamiento para llegar antes, decidir mejor y cometer menos errores"
        description="Convertimos promociones, avisos y requisitos en una estrategia clara para acceder a vivienda protegida en Cataluña."
        actions={
          <>
            <ButtonLink href="#hablemos">Hablar con Radar VPO</ButtonLink>
            <ButtonLink href="/cursos" variant="secondary">Ver cursos</ButtonLink>
          </>
        }
      >
        <SurfaceCard className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Qué hacemos</p>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            Vigilamos oportunidades, interpretamos requisitos, priorizamos fechas y te ayudamos a preparar el proceso antes de que sea tarde.
          </p>
        </SurfaceCard>
      </PageHero>

      <section className="space-y-4">
        <SectionHeader eyebrow="Beneficios" title="Por qué merece la pena pagar" />
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
      </section>

      {loading ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </section>
      ) : (
        <section className="space-y-4">
          <SectionHeader eyebrow="Qué incluye" title="Elige el nivel de ayuda que necesitas" description="Cursos para aprender, avisos para vigilar y asesoría para ir acompañado." />
        <section className="grid gap-4 lg:grid-cols-3">
          {displayedServices.map((service) => {
            const href = service.href;
            const external = /^https?:\/\//.test(href);
            return (
              <article
                key={service.title}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--stroke)] bg-gradient-to-br from-emerald-50 to-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(30,31,28,0.12)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#4E8F3A,#A7D08A,#4E8F3A)] opacity-70" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">{service.eyebrow}</p>
                <h2 className="mt-3 text-2xl font-bold text-[var(--ink)]">{service.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  {service.copy}
                </p>
                {external ? (
                  <a
                    href={href}
                    className="mt-5 inline-flex rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-semibold text-white shadow-card transition duration-300 group-hover:bg-[var(--green-900)]"
                    rel="noopener noreferrer"
                  >
                    {service.cta}
                  </a>
                ) : (
                  <Link
                    href={href}
                    className="mt-5 inline-flex rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-semibold text-white shadow-card transition duration-300 group-hover:bg-[var(--green-900)]"
                  >
                    {service.cta}
                  </Link>
                )}
              </article>
            );
          })}
        </section>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard className="p-5">
          <SectionHeader eyebrow="Casos prácticos" title="Cuándo te ayudamos" />
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
            {useCases.map((item) => <li key={item} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">{item}</li>)}
          </ul>
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <SectionHeader eyebrow="Testimonios" title="Lo que buscamos conseguir" />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {['Me enteré de una promoción que no tenía controlada.', 'Llegué a la solicitud con documentación preparada.'].map((quote) => (
              <blockquote key={quote} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 text-sm font-semibold leading-6 text-[var(--ink)]">
                “{quote}”
                <footer className="mt-3 text-xs font-normal text-[var(--ink-soft)]">Usuario Radar VPO</footer>
              </blockquote>
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
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
            <button className="w-full rounded-full bg-[var(--green-700)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--green-900)]">Enviar consulta</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href={whatsappContactUrl}>WhatsApp</ButtonLink>
            <ButtonLink href="mailto:info@radarvpo.com" variant="secondary">Email</ButtonLink>
            <ButtonLink href={whatsappContactUrl} variant="secondary">Reservar llamada</ButtonLink>
          </div>
        </SurfaceCard>
      </section>
    </main>
  );
}
