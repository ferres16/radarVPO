'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { SkeletonCard } from '@/components/skeleton-card';
import { api } from '@/lib/api';
import type { Service } from '@/types';

const whatsappContactUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL ||
  'https://wa.me/34600111222?text=Hola%2C%20quiero%20activar%20el%20seguimiento%20individualizado%20de%20Radar%20VPO.';

const fallbackServices = [
  {
    eyebrow: '01 · Cursos y formaciones',
    title: 'Cursos vivos y guias accionables',
    copy:
      'Microlecciones, checklists y recursos claros para entender requisitos, plazos y estrategias reales.',
    cta: 'Ver cursos',
    href: '/cursos',
    accent: 'from-cyan-50 to-white',
  },
  {
    eyebrow: '02 · Alertas Pro',
    title: 'Alertas proactivas en WhatsApp',
    copy:
      'Nuevas promociones, cambios en bases y recordatorios criticos, sin que tengas que estar revisando.',
    cta: 'Activar alertas Pro',
    href: whatsappContactUrl,
    accent: 'from-emerald-50 to-white',
  },
  {
    eyebrow: '03 · Asesoria personalizada',
    title: 'Asesoria personalizada (TODO incluido)',
    copy:
      'Incluye cursos + alertas Pro + acompañamiento 1:1 para preparar cada convocatoria sin perder pasos.',
    cta: 'Quiero asesoria',
    href: whatsappContactUrl,
    accent: 'from-white to-cyan-50',
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const rows = await api.listServices();
        if (!active) return;
        setServices(rows);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar servicios');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="shell pb-16">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--stroke)] bg-[linear-gradient(135deg,#f4fbff_0%,#eef7f1_55%,#ffffff_100%)] p-6 shadow-card md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(56,189,248,0.12)] blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[rgba(47,107,36,0.10)] blur-3xl animate-float-slow-delay" />
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--green-700)]">Servicios</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-[var(--ink)] md:text-6xl display-type">
          Acelera tu acceso a VPO con un plan claro y accionable.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--ink-soft)]">
          Elige cursos, activa alertas Pro o contrata asesoria personalizada. En asesoria, todo esta incluido.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-white">Acceso total en asesoria</span>
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ink)]">WhatsApp Pro</span>
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ink)]">Cursos vivos</span>
        </div>
      </section>

      {error ? (
        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{error}</div>
      ) : null}

      {loading ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </section>
      ) : services.length > 0 ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {services.map((service) => {
            const href = service.stripePaymentLink || whatsappContactUrl;
            const external = /^https?:\/\//.test(href);
            return (
              <article
                key={service.id}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--stroke)] bg-gradient-to-br from-emerald-50 to-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(30,31,28,0.12)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#4E8F3A,#A7D08A,#4E8F3A)] opacity-70" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">{service.serviceType}</p>
                <h2 className="mt-3 text-2xl font-bold text-[var(--ink)]">{service.name}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  {service.description || 'Servicio activo gestionado desde el panel de administracion.'}
                </p>
                {service.price ? (
                  <p className="mt-4 text-2xl font-black text-[var(--ink)]">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: service.currency || 'EUR',
                      maximumFractionDigits: 0,
                    }).format(Number(service.price))}
                  </p>
                ) : null}
                {external ? (
                  <a
                    href={href}
                    className="mt-5 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white shadow-card transition duration-300 group-hover:bg-[var(--green-700)]"
                    rel="noopener noreferrer"
                  >
                    Activar servicio
                  </a>
                ) : (
                  <Link
                    href={href}
                    className="mt-5 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white shadow-card transition duration-300 group-hover:bg-[var(--green-700)]"
                  >
                    Activar servicio
                  </Link>
                )}
              </article>
            );
          })}
        </section>
      ) : (
        <section className="mt-6">
          <EmptyState title="Servicios en preparacion" description="El equipo aun no ha publicado servicios activos desde admin." />
        </section>
      )}

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {fallbackServices.map((service) => (
          <article
            key={service.title}
            className={`group relative overflow-hidden rounded-[1.75rem] border border-[var(--stroke)] bg-gradient-to-br ${service.accent} p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(30,31,28,0.12)]`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#4E8F3A,#A7D08A,#4E8F3A)] opacity-70" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">{service.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-bold text-[var(--ink)]">{service.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{service.copy}</p>
            <Link
              href={service.href}
              className="mt-5 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white shadow-card transition duration-300 group-hover:bg-[var(--green-700)]"
            >
              {service.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[1.75rem] border border-[var(--stroke)] bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Metodo Radar VPO</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--ink)] display-type">
            Claridad, velocidad y acompañamiento real.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
            La asesoria personalizada incluye TODO: cursos activos, alertas Pro y un plan 1:1 para revisar requisitos,
            preparar documentacion y mantener el seguimiento hasta el cierre.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">Cursos + alertas Pro</span>
            <span className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">Asesoria 1:1</span>
            <span className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">Checklist de requisitos</span>
          </div>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--stroke)] bg-[var(--bg-app)] p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Ruta rapida</p>
          <ol className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
            <li>1. Elige el servicio que necesitas hoy.</li>
            <li>2. Recibe guia clara y respuestas directas.</li>
            <li>3. Te acompañamos hasta la resolucion.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={whatsappContactUrl} className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
              Hablar por WhatsApp
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
