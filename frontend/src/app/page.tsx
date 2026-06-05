import Link from 'next/link';
import { api } from '@/lib/api';
import { NewsCard } from '@/components/news-card';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { FollowupButton } from '@/components/followup-button';
import { getDaysRemaining, shouldShowAlert } from '@/lib/alert-countdown';

export default async function Home() {
  const [alerts, news] = await Promise.all([
    api.getUpcomingAlerts().catch(() => []),
    api.getNews().catch(() => []),
  ]);

  const latestNews = news.slice(0, 3);
  const activeAlerts = alerts
    .filter((promotion) => promotion.type === 'alert')
    .map((promotion) => {
      const daysRemaining = getDaysRemaining(promotion.estimatedPublicationDate);
      return { promotion, daysRemaining };
    })
    .filter((entry): entry is { promotion: (typeof alerts)[number]; daysRemaining: number } => shouldShowAlert(entry.daysRemaining))
    .slice(0, 3);

  const whatsappContactUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL ||
    'https://wa.me/34600111222?text=Hola%2C%20quiero%20activar%20el%20seguimiento%20individualizado%20de%20Radar%20VPO.';

  const serviceTags = [
    'Asesoria personalizada',
    'Seguimiento individualizado',
    'Respuestas a dudas 1:1',
    'Acompañamiento durante todo el proceso',
    'Alertas Pro por WhatsApp',
    'Cursos y formaciones',
    'Checklist de documentacion',
    'Preparacion de carpeta VPO',
  ];

  const stats = [
    { value: '1:1', label: 'Asesoría personalizada' },
    { value: 'Diaria', label: 'Actualidad y noticias' },
    { value: '24/7', label: 'Seguimiento activo' },
  ];

  return (
    <div className="hero-bg min-h-screen pb-20 md:pb-0">
      <main className="shell space-y-5 py-3 md:py-6">
        <section className="grid items-stretch gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="surface-card relative overflow-hidden p-5 md:h-full md:p-6 animate-fade-up">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(78,143,58,0.12),transparent_35%)]" />
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[rgba(56,189,248,0.12)] blur-3xl" />
            <div className="absolute -bottom-10 left-1/2 h-32 w-32 rounded-full bg-[rgba(47,107,36,0.08)] blur-2xl" />

            <div className="relative max-w-2xl">
              <span className="inline-flex rounded-full border border-[rgba(56,189,248,0.20)] bg-[rgba(56,189,248,0.10)] px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[var(--cyan-700)]">
                Radar VPO Catalunya
              </span>
              <h1 className="display-type mt-3 text-3xl font-black leading-[0.96] tracking-tight text-[var(--ink)] md:text-5xl">
                Asesoría y seguimiento individualizado para vivienda protegida.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-soft)] md:text-base">
                Centralizamos asesoría, noticias y seguimiento activo en Catalunya para que tomes decisiones con más criterio, menos ruido y mejores tiempos.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <FollowupButton className="rounded-full bg-[var(--green-500)] px-5 py-2.5 text-sm font-semibold text-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--green-700)] disabled:opacity-60" />
                <Link href="/services" className="rounded-full border border-[var(--stroke)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--bg-eco)]">
                  Ver servicios
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[rgba(56,189,248,0.14)] bg-white/82 p-3.5 shadow-card backdrop-blur animate-fade-up">
                    <p className="display-type text-xl font-black text-[var(--ink)]">{stat.value}</p>
                    <p className="mt-1 text-xs text-[var(--ink-soft)]">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 min-h-36 rounded-3xl border border-[rgba(56,189,248,0.14)] bg-[linear-gradient(135deg,rgba(9,14,24,0.04),rgba(255,255,255,0.96))] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cyan-700)]">Servicios</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {serviceTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[rgba(56,189,248,0.18)] bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--cyan-700)] shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  Además de avisos, resolvemos dudas reales y te guiamos paso a paso para que no te quedes fuera por un detalle de requisitos o plazos.
                </p>
              </div>
            </div>
          </article>

          <aside className="animate-fade-up-delay-1">
            <div className="surface-card flex h-full flex-col gap-4 p-4">
              <div className="rounded-2xl border border-[rgba(15,118,110,0.18)] bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(255,255,255,0.96))] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[rgba(15,118,110,0.9)]">El curso que necesitas</p>
                <h2 className="display-type mt-2 text-xl font-black tracking-tight text-[var(--ink)]">Guia base para desbloquear tu VPO</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  Estamos preparando el curso con recursos descargables, casos reales y plan de accion.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[rgba(15,118,110,0.9)]">Proximamente</span>
                  <Link href="/cursos" className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
                    Ir al curso
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-[rgba(78,143,58,0.25)] bg-[linear-gradient(135deg,rgba(78,143,58,0.12),rgba(255,255,255,0.96))] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Tambien hay otros cursos</p>
                <h2 className="display-type mt-2 text-xl font-black tracking-tight text-[var(--ink)]">Explora rutas de aprendizaje modernas</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  Aprende por bloques visuales, avances guardados y contenido que se actualiza con cada convocatoria.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/cursos" className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
                    Ver mas cursos
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-[rgba(16,185,129,0.22)] bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(255,255,255,0.96))] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Alertas Pro en WhatsApp</p>
                <h3 className="display-type mt-2 text-lg font-black text-[var(--ink)]">Activa avisos premium en tiempo real</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Recibe cambios clave, nuevas promociones y recordatorios de fechas criticas directamente en tu WhatsApp.
                </p>
                <Link href={whatsappContactUrl} className="mt-3 inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-card transition hover:bg-[var(--bg-eco)]">
                  Activar alertas Pro
                </Link>
              </div>

              <div className="rounded-2xl border border-[rgba(56,189,248,0.22)] bg-[linear-gradient(135deg,rgba(56,189,248,0.10),rgba(255,255,255,0.96))] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cyan-700)]">Asesoria 1:1</p>
                <h3 className="display-type mt-2 text-lg font-black text-[var(--ink)]">Acompañamiento individualizado</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Revisamos tu caso, requisitos y plazos con seguimiento directo para que no pierdas oportunidades.
                </p>
                <Link href="/services" className="mt-3 inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-card transition hover:bg-[var(--bg-eco)]">
                  Ver asesorias
                </Link>
              </div>
            </div>
          </aside>
        </section>

        <section className="surface-card p-4 animate-fade-up-delay-2">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cyan-700)]">Noticias diarias</p>
              <h2 className="display-type mt-1 text-xl font-black text-[var(--ink)]">Actualidad útil para decidir mejor cada día</h2>
            </div>
            <Link href="/news" className="text-sm font-semibold text-[var(--cyan-700)]">
              Ver más
            </Link>
          </div>

          {latestNews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--stroke)] bg-[var(--bg-app)] p-5 text-center">
              <p className="text-base font-semibold text-[var(--ink)]">No hay noticias publicadas ahora mismo</p>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">Cuando publiquemos novedades relevantes de vivienda aparecerán aquí.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {latestNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <section className="surface-card p-4 animate-fade-up-delay-2">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Seguimiento activo</p>
              <h2 className="display-type mt-1 text-xl font-black text-[var(--ink)]">Próximas viviendas por salir</h2>
            </div>
            <Link href="/alerts" className="text-sm font-semibold text-[var(--green-700)]">
              Ver seguimiento
            </Link>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--stroke)] bg-[var(--bg-app)] p-5 text-center">
              <p className="text-base font-semibold text-[var(--ink)]">No hay seguimientos activos ahora mismo</p>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">Cuando aparezca una nueva promoción te la mostraremos aquí con antelación.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {activeAlerts.map(({ promotion, daysRemaining }) => (
                <div key={promotion.id} className="rounded-3xl border border-[rgba(78,143,58,0.24)] bg-[linear-gradient(135deg,rgba(78,143,58,0.10),rgba(255,255,255,0.95))] p-4 shadow-card transition hover:-translate-y-0.5">
                  <AlertCountdownBadge daysRemaining={daysRemaining} size="sm" />
                  <p className="mt-4 text-sm font-semibold leading-6 text-[var(--ink)]">{promotion.title}</p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">{promotion.municipality || 'Catalunya'}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
