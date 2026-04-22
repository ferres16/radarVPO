import Link from 'next/link';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { MobileNav } from '@/components/mobile-nav';
import { PromotionCard } from '@/components/promotion-card';

function parseDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getUpcomingWindow(promotion: {
  estimatedPublicationDate?: string | null;
  publishedAt?: string | null;
  alertDetectedAt?: string;
}) {
  const reference =
    parseDate(promotion.estimatedPublicationDate) ??
    parseDate(promotion.publishedAt) ??
    parseDate(promotion.alertDetectedAt);

  if (!reference) return null;

  const daysLeft = Math.ceil(
    (reference.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (daysLeft >= 0 && daysLeft <= 60) {
    return { state: 'active' as const, daysLeft };
  }

  const daysSince = Math.floor(
    (Date.now() - reference.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSince >= 60 && daysSince <= 67) {
    return { state: 'expired' as const, daysSince };
  }

  return null;
}

export default async function Home() {
  const [promotions, alerts] = await Promise.all([
    api.getPromotions().catch(() => []),
    api.getUpcomingAlerts().catch(() => []),
  ]);

  const recentPromotions = promotions.slice(0, 10);
  const upcoming = alerts
    .map((promotion) => ({ promotion, window: getUpcomingWindow(promotion) }))
    .filter((entry): entry is { promotion: (typeof alerts)[number]; window: NonNullable<ReturnType<typeof getUpcomingWindow>> } => Boolean(entry.window));
  const activeAlerts = upcoming.filter((entry) => entry.window.state === 'active');

  const stats = [
    { value: `${promotions.length}+`, label: 'Promociones publicadas' },
    { value: `${alerts.length}+`, label: 'Alertas seguidas' },
    { value: '24/7', label: 'Monitorización' },
  ];

  const steps = [
    {
      title: '1. Activa tu perfil',
      text: 'Crea tu cuenta y define dónde buscas vivienda, qué tipo te interesa y qué límites tienes.',
    },
    {
      title: '2. Sigue el radar',
      text: 'Te mostramos nuevas promociones y alertas en una interfaz clara, sin ruido ni intermediarios.',
    },
    {
      title: '3. Llega antes',
      text: 'Revisa requisitos, documentos y plazos para no perder oportunidades reales de acceso.',
    },
  ];

  const proBenefits = [
    'Alertas antes que nadie en promociones nuevas y cambios de estado.',
    'Seguimiento priorizado de VPO, vivienda pública y alquiler asequible.',
    'Avisos preparados para WhatsApp y notificaciones rápidas.',
  ];

  return (
    <div className="hero-bg min-h-screen pb-20 md:pb-0">
      <main className="shell space-y-5 py-3 md:py-6">
        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="surface-card relative overflow-hidden p-5 md:p-6 animate-fade-up">
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

              <div className="mt-5 rounded-3xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Cómo funciona</p>
                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  {steps.map((step, index) => (
                    <div key={step.title} className="flex gap-3 rounded-2xl border border-[var(--stroke)] bg-white p-3 shadow-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--green-500)] text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-[var(--ink)]">{step.title}</p>
                        <p className="mt-1 text-sm text-[var(--ink-soft)]">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <aside className="space-y-3 animate-fade-up-delay-1">
            <div className="surface-card p-4">
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
              </div>
            </div>
          </aside>
        </section>

        <section className="surface-card p-4 animate-fade-up-delay-2">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Alertas próximas</p>
              <h2 className="mt-1 text-xl font-black text-[var(--ink)]">Suben primero las alertas pendientes</h2>
            </div>
            <Link href="/promotions" className="text-sm font-semibold text-[var(--green-700)]">
              Explorar
            </Link>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--stroke)] bg-[var(--bg-app)] p-5 text-center">
              <p className="text-base font-semibold text-[var(--ink)]">No hay alertas activas ahora mismo</p>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">Cuando aparezca una nueva promoción te la mostraremos aquí con antelación.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {activeAlerts.slice(0, 3).map(({ promotion, window }) => (
                <div key={promotion.id} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 transition hover:-translate-y-0.5">
                  <p className="text-sm font-semibold text-[var(--ink)]">{promotion.title}</p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    {promotion.municipality || 'Catalunya'} · quedan {window.daysLeft} días para el plazo estimado.
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="surface-card p-4 animate-fade-up-delay-2">
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
              <div className="grid gap-4 md:grid-cols-2">
                {recentPromotions.map((promotion) => (
                  <PromotionCard key={promotion.id} promotion={promotion} />
                ))}
              </div>
            )}
          </article>

          <article className="surface-card p-4 animate-fade-up-delay-2">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Foro</p>
                <h2 className="mt-1 text-xl font-black text-[var(--ink)]">Comunidad y actualidad</h2>
              </div>
              <Link href="/news" className="text-sm font-semibold text-[var(--green-700)]">
                Entrar al foro
              </Link>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">Dudas frecuentes</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">Requisitos, plazos, documentación y pasos de inscripción explicados con lenguaje claro.</p>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">Cambios normativos</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">Seguimiento del contexto de vivienda para entender qué cambia y cómo te afecta.</p>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">Experiencias reales</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">Comparte y consulta experiencias de otras personas que están buscando vivienda en Catalunya.</p>
              </div>
            </div>
          </article>
        </section>

      </main>
      <MobileNav />
    </div>
  );
}
