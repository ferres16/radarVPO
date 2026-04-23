import Link from 'next/link';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { PromotionCard } from '@/components/promotion-card';

function parseDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysUntilPublication(promotion: {
  estimatedPublicationDate?: string | null;
  alertDate?: string;
  alertDetectedAt?: string;
}) {
  const estimatedPublicationDate = parseDate(promotion.estimatedPublicationDate);
  if (estimatedPublicationDate) {
    return Math.floor((estimatedPublicationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  const reference = parseDate(promotion.alertDate) ?? parseDate(promotion.alertDetectedAt);
  if (!reference) return null;
  return Math.floor((Date.now() - reference.getTime()) / (1000 * 60 * 60 * 24));
}

function publicationEtaText(daysUntil?: number | null) {
  if (daysUntil === null || daysUntil === undefined) {
    return 'sin fecha estimada disponible.';
  }

  if (daysUntil > 0) {
    return `faltan ${daysUntil} días para la publicación estimada.`;
  }
  if (daysUntil === 0) {
    return 'publicación estimada para hoy.';
  }
  return `publicación estimada vencida hace ${Math.abs(daysUntil)} días.`;
}

export default async function Home() {
  const [promotions, alerts] = await Promise.all([
    api.getPromotions().catch(() => []),
    api.getUpcomingAlerts().catch(() => []),
  ]);

  const recentPromotions = promotions.slice(0, 10);
  const activeAlerts = alerts
    .filter((promotion) => promotion.type === 'alert')
    .map((promotion) => {
      const daysUntil = daysUntilPublication(promotion);
      return { promotion, daysUntil };
    })
    .filter((entry): entry is { promotion: (typeof alerts)[number]; daysUntil: number } => entry.daysUntil !== null && entry.daysUntil >= -67 && entry.daysUntil <= 67)
    .slice(0, 3);

  const serviceTags = [
    'Asesoria personalizada',
    'Guia PDF de compra',
    'Radar VPO Pro SMS',
    'Alertas por cambios de estado',
    'Checklist de documentacion',
    'Seguimiento de plazos',
  ];

  const stats = [
    { value: `${promotions.length}+`, label: 'Promociones publicadas' },
    { value: `${alerts.length}+`, label: 'Alertas seguidas' },
    { value: '24/7', label: 'Monitorización' },
  ];

  const proBenefits = [
    'Alertas antes que nadie en promociones nuevas y cambios de estado.',
    'Seguimiento priorizado de VPO, vivienda pública y alquiler asequible.',
    'Avisos preparados para WhatsApp y notificaciones rápidas.',
  ];

  return (
    <div className="hero-bg min-h-screen pb-20 md:pb-0">
      <main className="shell space-y-5 py-3 md:py-6">
        <section className="grid items-stretch gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="surface-card relative overflow-hidden p-5 md:h-full md:p-6 animate-fade-up">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[rgba(78,143,58,0.12)] blur-3xl" />
            <div className="absolute -bottom-10 left-1/2 h-32 w-32 rounded-full bg-[rgba(47,107,36,0.08)] blur-2xl" />

            <div className="relative max-w-2xl">
              <span className="inline-flex rounded-full border border-[rgba(78,143,58,0.18)] bg-[rgba(78,143,58,0.08)] px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">
                Radar VPO Catalunya
              </span>
              <h1 className="mt-3 text-3xl font-black leading-[0.96] tracking-tight text-[var(--ink)] md:text-5xl">
                Encuentra VPO antes que nadie.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-soft)] md:text-base">
                Centralizamos promociones, alertas y comunidad de vivienda en Catalunya para que puedas reaccionar antes y preparar mejor cada solicitud.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/register" className="rounded-full bg-[var(--green-500)] px-5 py-2.5 text-sm font-semibold text-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--green-700)]">
                  Activar alertas
                </Link>
                <Link href="/promotions" className="rounded-full border border-[var(--stroke)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--bg-eco)]">
                  Explorar promociones
                </Link>
                <Link href="/services" className="rounded-full border border-[var(--stroke)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--bg-eco)]">
                  Ver servicios
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[var(--stroke)] bg-white/80 p-3.5 shadow-card backdrop-blur animate-fade-up">
                    <p className="text-xl font-black text-[var(--ink)]">{stat.value}</p>
                    <p className="mt-1 text-xs text-[var(--ink-soft)]">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 min-h-36 rounded-3xl border border-[var(--stroke)] bg-[linear-gradient(135deg,rgba(78,143,58,0.10),rgba(255,255,255,0.96))] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Servicios</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {serviceTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[rgba(78,143,58,0.24)] bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--green-700)] shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <aside className="animate-fade-up-delay-1">
            <div className="surface-card flex h-full flex-col p-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Sección PRO</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-[var(--ink)]">Más rápido, más útil, más cerca de la oportunidad</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                Radar VPO PRO está pensado para quien quiere llegar antes, filtrar mejor y no perder convocatorias por exceso de ruido.
              </p>
              <div className="mt-3 space-y-2.5">
                {proBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 rounded-2xl bg-[var(--bg-app)] p-2.5">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(78,143,58,0.14)] text-xs font-black text-[var(--green-700)]">✓</span>
                    <p className="text-sm text-[var(--ink)]">{benefit}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/services" className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
                  Ver PRO
                </Link>
                <Link href="/register" className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
                  Empezar gratis
                </Link>
              </div>
              <div className="mt-4 rounded-2xl bg-[linear-gradient(135deg,#1e1f1c,#325b26)] p-4 text-white shadow-card">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Radar VPO PRO</p>
                <p className="mt-2 text-base font-black leading-tight">Alertas, seguimiento y foco en una sola pantalla.</p>
                <p className="mt-2 text-sm text-white/75">
                  Activa el plan PRO para priorizar avisos y reducir el ruido al mínimo.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {serviceTags.slice(4).map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 px-3 py-1 font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="surface-card p-4 animate-fade-up-delay-2">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Alertas próximas</p>
              <h2 className="mt-1 text-xl font-black text-[var(--ink)]">Próximas viviendas por salir</h2>
            </div>
            <Link href="/alerts" className="text-sm font-semibold text-[var(--green-700)]">
              Ver más
            </Link>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--stroke)] bg-[var(--bg-app)] p-5 text-center">
              <p className="text-base font-semibold text-[var(--ink)]">No hay alertas activas ahora mismo</p>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">Cuando aparezca una nueva promoción te la mostraremos aquí con antelación.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {activeAlerts.map(({ promotion, daysUntil }) => (
                <div key={promotion.id} className="rounded-2xl border border-[rgba(78,143,58,0.24)] bg-[linear-gradient(135deg,rgba(78,143,58,0.12),rgba(255,255,255,0.92))] p-4 shadow-card transition hover:-translate-y-0.5">
                  <p className="text-sm font-semibold text-[var(--ink)]">{promotion.title}</p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    {promotion.municipality || 'Catalunya'} · {publicationEtaText(daysUntil)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="surface-card p-4 animate-fade-up-delay-2">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Promociones recientes</p>
              <h2 className="mt-1 text-xl font-black text-[var(--ink)]">Últimas 10 publicadas</h2>
            </div>
            <Link href="/promotions" className="text-sm font-semibold text-[var(--green-700)]">
              Ver todas
            </Link>
          </div>

          {recentPromotions.length === 0 ? (
            <EmptyState title="Sin promociones publicadas" description="Aún no hay promociones publicadas." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recentPromotions.map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
