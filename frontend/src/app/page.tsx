import Link from 'next/link';
import { api } from '@/lib/api';
import { NewsCard } from '@/components/news-card';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
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

  const serviceTags = [
    'Asesoria personalizada',
    'Seguimiento individualizado',
    'Respuestas a dudas 1:1',
    'Acompañamiento durante todo el proceso',
    'Prioridad en plazos y cambios',
    'Curso de iniciacion VPO',
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
              <span className="inline-flex rounded-full border border-[rgba(56,189,248,0.20)] bg-[rgba(56,189,248,0.10)] px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-(--cyan-700)">
                Radar VPO Catalunya
              </span>
              <h1 className="mt-3 text-3xl font-black leading-[0.96] tracking-tight text-(--ink) md:text-5xl display-type">
                Asesoría y seguimiento individualizado para vivienda protegida.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-(--ink-soft) md:text-base">
                Centralizamos asesoría, noticias y seguimiento activo en Catalunya para que tomes decisiones con más criterio, menos ruido y mejores tiempos.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/register" className="rounded-full bg-(--green-500) px-5 py-2.5 text-sm font-semibold text-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-(--green-700)">
                  Pedir seguimiento
                </Link>
                <Link href="/services" className="rounded-full border border-(--stroke) bg-white px-5 py-2.5 text-sm font-semibold text-(--ink) shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-(--bg-eco)">
                  Ver servicios
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[rgba(56,189,248,0.14)] bg-white/82 p-3.5 shadow-card backdrop-blur animate-fade-up">
                    <p className="text-xl font-black text-(--ink) display-type">{stat.value}</p>
                    <p className="mt-1 text-xs text-(--ink-soft)">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 min-h-36 rounded-3xl border border-[rgba(56,189,248,0.14)] bg-[linear-gradient(135deg,rgba(9,14,24,0.04),rgba(255,255,255,0.96))] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-(--cyan-700)">Servicios</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {serviceTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[rgba(56,189,248,0.18)] bg-white/90 px-3 py-1 text-xs font-semibold text-(--cyan-700) shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-(--ink-soft)">
                  Además de avisos, resolvemos dudas reales y te guiamos paso a paso para que no te quedes fuera por un detalle de requisitos o plazos.
                </p>
              </div>
            </div>
          </article>

          <aside className="animate-fade-up-delay-1">
            <div className="surface-card flex h-full flex-col gap-4 p-4">
              <div className="rounded-2xl border border-[rgba(78,143,58,0.25)] bg-[linear-gradient(135deg,rgba(78,143,58,0.12),rgba(255,255,255,0.96))] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-(--green-700)">Curso de iniciacion</p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-(--ink) display-type">Arranca con una guia clara y modular</h2>
                <p className="mt-2 text-sm leading-6 text-(--ink-soft)">
                  Modulos breves, ejemplos reales y recursos descargables para entender la VPO desde el primer dia.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/curso/guia-vpo-esencial" className="rounded-full bg-(--ink) px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
                    Ver curso de iniciacion
                  </Link>
                  <Link href="/register" className="rounded-full border border-(--stroke) bg-white px-4 py-2 text-sm font-semibold text-(--ink) transition hover:bg-(--bg-eco)">
                    Crear cuenta
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-[rgba(56,189,248,0.22)] bg-[linear-gradient(135deg,rgba(56,189,248,0.10),rgba(255,255,255,0.96))] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-(--cyan-700)">Asesoria 1:1</p>
                <h3 className="mt-2 text-lg font-black text-(--ink) display-type">Acompañamiento individualizado</h3>
                <p className="mt-2 text-sm text-(--ink-soft)">
                  Revisamos tu caso, requisitos y plazos con seguimiento directo para que no pierdas oportunidades.
                </p>
                <Link href="/services" className="mt-3 inline-flex rounded-full border border-(--stroke) bg-white px-4 py-2 text-sm font-semibold text-(--ink) shadow-card transition hover:bg-(--bg-eco)">
                  Ver asesorias
                </Link>
              </div>
            </div>
          </aside>
        </section>

        <section className="surface-card p-4 animate-fade-up-delay-2">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-(--cyan-700)">Noticias diarias</p>
              <h2 className="mt-1 text-xl font-black text-(--ink) display-type">Actualidad útil para decidir mejor cada día</h2>
            </div>
            <Link href="/news" className="text-sm font-semibold text-(--cyan-700)">
              Ver más
            </Link>
          </div>

          {latestNews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-(--stroke) bg-(--bg-app) p-5 text-center">
              <p className="text-base font-semibold text-(--ink)">No hay noticias publicadas ahora mismo</p>
              <p className="mt-2 text-sm text-(--ink-soft)">Cuando publiquemos novedades relevantes de vivienda aparecerán aquí.</p>
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-(--green-700)">Seguimiento activo</p>
              <h2 className="mt-1 text-xl font-black text-(--ink) display-type">Próximas viviendas por salir</h2>
            </div>
            <Link href="/alerts" className="text-sm font-semibold text-(--green-700)">
              Ver seguimiento
            </Link>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-(--stroke) bg-(--bg-app) p-5 text-center">
              <p className="text-base font-semibold text-(--ink)">No hay seguimientos activos ahora mismo</p>
              <p className="mt-2 text-sm text-(--ink-soft)">Cuando aparezca una nueva promoción te la mostraremos aquí con antelación.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {activeAlerts.map(({ promotion, daysRemaining }) => (
                <div key={promotion.id} className="rounded-3xl border border-[rgba(78,143,58,0.24)] bg-[linear-gradient(135deg,rgba(78,143,58,0.10),rgba(255,255,255,0.95))] p-4 shadow-card transition hover:-translate-y-0.5">
                  <AlertCountdownBadge daysRemaining={daysRemaining} size="sm" />
                  <p className="mt-4 text-sm font-semibold leading-6 text-(--ink)">{promotion.title}</p>
                  <p className="mt-2 text-sm text-(--ink-soft)">{promotion.municipality || 'Catalunya'}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
