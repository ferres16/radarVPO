import Link from 'next/link';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { MobileNav } from '@/components/mobile-nav';
import { NewsCard } from '@/components/news-card';
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
  const [promotions, alerts, news] = await Promise.all([
    api.getPromotions().catch(() => []),
    api.getUpcomingAlerts().catch(() => []),
    api.getNews().catch(() => []),
  ]);

  const recentPromotions = promotions.slice(0, 6);
  const recentNews = news.slice(0, 3);
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
    <div className="hero-bg min-h-screen pb-24 md:pb-0">
      <main className="shell space-y-8 py-4 md:py-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="surface-card relative overflow-hidden p-6 md:p-8 animate-fade-up">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[rgba(78,143,58,0.12)] blur-3xl" />
            <div className="absolute -bottom-10 left-1/2 h-32 w-32 rounded-full bg-[rgba(47,107,36,0.08)] blur-2xl" />

            <div className="relative max-w-2xl">
              <span className="inline-flex rounded-full border border-[rgba(78,143,58,0.18)] bg-[rgba(78,143,58,0.08)] px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">
                Radar VPO Catalunya
              </span>
              <h1 className="mt-4 text-4xl font-black leading-[0.96] tracking-tight text-[var(--ink)] md:text-6xl">
                Encuentra VPO antes que nadie.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--ink-soft)] md:text-lg">
                Centralizamos promociones, alertas y noticias de vivienda en Catalunya para que puedas reaccionar antes, entender qué cambia y preparar mejor cada solicitud.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/register" className="rounded-full bg-[var(--green-500)] px-5 py-3 text-sm font-semibold text-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--green-700)]">
                  Activar alertas
                </Link>
                <Link href="/promotions" className="rounded-full border border-[var(--stroke)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--bg-eco)]">
                  Explorar promociones
                </Link>
                <Link href="/services" className="rounded-full border border-[var(--stroke)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--bg-eco)]">
                  Ver servicios
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[var(--stroke)] bg-white/80 p-4 shadow-card backdrop-blur animate-fade-up">
                    <p className="text-2xl font-black text-[var(--ink)]">{stat.value}</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="space-y-4 animate-fade-up-delay-1">
            <div className="surface-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Sección PRO</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--ink)]">Más rápido, más útil, más cerca de la oportunidad</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                Radar VPO PRO está pensado para quien quiere llegar antes, filtrar mejor y no perder convocatorias por exceso de ruido.
              </p>
              <div className="mt-4 space-y-3">
                {proBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 rounded-2xl bg-[var(--bg-app)] p-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(78,143,58,0.14)] text-xs font-black text-[var(--green-700)]">✓</span>
                    <p className="text-sm text-[var(--ink)]">{benefit}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/services" className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
                  Ver PRO
                </Link>
                <Link href="/register" className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
                  Empezar gratis
                </Link>
              </div>
            </div>

            <div className="surface-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Cómo funciona</p>
              <div className="mt-3 space-y-3">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex gap-3 rounded-2xl border border-[var(--stroke)] bg-white p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--green-500)] text-sm font-black text-white">{index + 1}</span>
                    <div>
                      <p className="font-semibold text-[var(--ink)]">{step.title}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="surface-card p-5 animate-fade-up-delay-2">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Promociones recientes</p>
                <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Lo último publicado</h2>
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

          <article className="surface-card p-5 animate-fade-up-delay-2">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Alertas próximas</p>
                <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">No pierdas el siguiente paso</h2>
              </div>
              <Link href="/promotions" className="text-sm font-semibold text-[var(--green-700)]">
                Explorar
              </Link>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[var(--stroke)] bg-[var(--bg-app)] p-6 text-center">
                <p className="text-base font-semibold text-[var(--ink)]">No hay alertas activas ahora mismo</p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">Cuando aparezca una nueva promoción te la mostraremos aquí con antelación.</p>
              </div>
            ) : (
              <div className="space-y-3">
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
          </article>
        </section>

        <section className="surface-card p-5 animate-fade-up-delay-2">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Beneficios</p>
              <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Todo lo que te ahorra tiempo</h2>
            </div>
            <Link href="/services" className="text-sm font-semibold text-[var(--green-700)]">
              Conocer servicios
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Seguimiento claro', 'Promociones, noticias y alertas separadas para que encuentres rápido lo que importa.'],
              ['Datos útiles', 'Información enfocada a requisitos, plazos y documentación, no a ruido institucional.'],
              ['Visión de producto', 'Un flujo pensado para usuarios reales que buscan vivienda, no para lectores ocasionales.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 hover-lift">
                <p className="font-semibold text-[var(--ink)]">{title}</p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="surface-card p-5 animate-fade-up-delay-2">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Noticias</p>
                <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Contexto de vivienda en Catalunya</h2>
              </div>
              <Link href="/news" className="text-sm font-semibold text-[var(--green-700)]">
                Ver todo
              </Link>
            </div>

            {recentNews.length === 0 ? (
              <p className="text-sm text-[var(--ink-soft)]">Aún no hay noticias publicadas.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {recentNews.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </article>

          <article className="surface-card flex flex-col justify-between p-5 animate-fade-up-delay-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">PRO</p>
              <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Haz que el radar trabaje por ti</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                El plan PRO concentra las alertas más rápidas, el seguimiento priorizado y la experiencia más directa para quien no quiere perder una oportunidad por llegar tarde.
              </p>
            </div>
            <div className="mt-5 rounded-3xl bg-[linear-gradient(135deg,#1e1f1c,#325b26)] p-5 text-white shadow-card">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Radar VPO PRO</p>
              <p className="mt-2 text-xl font-black leading-tight">Alertas, seguimiento y foco en una sola pantalla.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {['WhatsApp alerts', 'VPO', 'alquiler asequible', 'prioridad'].map((badge) => (
                  <span key={badge} className="rounded-full bg-white/10 px-3 py-1 font-semibold">
                    {badge}
                  </span>
                ))}
              </div>
              <Link href="/register" className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5">
                Activar PRO
              </Link>
            </div>
          </article>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
