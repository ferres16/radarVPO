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

  const stats = [
    { value: '10', label: 'Últimas promociones verificables' },
    { value: '24/7', label: 'Alertas y seguimiento activo' },
    { value: 'AA', label: 'Interfaz pensada para accesibilidad' },
  ];

  const quickActions = [
    { href: '/promotions', title: 'Buscar por municipio', description: 'Filtra promociones publicadas y compara oportunidades rápidamente.' },
    { href: '/services', title: 'Entender ayudas', description: 'Revisa acompañamiento, documentación y servicios de orientación.' },
    { href: '/cursos', title: 'Validar requisitos', description: 'Prepara tu candidatura con criterios claros antes de iniciar trámites.' },
  ];

  return (
    <div className="hero-bg min-h-screen pb-16">
      <main className="shell space-y-6 py-3 md:py-8">
        <section className="grid items-stretch gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <article className="surface-card relative overflow-hidden p-5 md:p-8 animate-fade-up">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(167,28,32,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(22,112,85,0.14),transparent_35%)]" />
            <div className="absolute right-8 top-8 h-44 w-44 rounded-full bg-[rgba(244,197,66,0.20)] blur-3xl animate-float-slow" />
            <div className="absolute -bottom-10 left-1/2 h-36 w-36 rounded-full bg-[rgba(54,189,248,0.12)] blur-2xl animate-float-slow-delay" />

            <div className="relative max-w-2xl">
              <span className="inline-flex rounded-full border border-[rgba(167,28,32,0.18)] bg-[rgba(167,28,32,0.08)] px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent-red)]">
                Portal de vivienda pública
              </span>
              <h1 className="display-type mt-4 text-4xl font-black leading-[0.95] tracking-tight text-[var(--ink)] md:text-6xl">
                Troba la teva vivenda pública a Catalunya
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--ink-soft)] md:text-lg">
                Consulta promocions, requisits, ajudes i oportunitats d&apos;habitatge públic en un únic lloc.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/promotions" className="rounded-full bg-[var(--green-700)] px-6 py-3 text-sm font-bold text-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--green-900)]">
                  Buscar vivienda
                </Link>
                <Link href="/services" className="rounded-full border border-[var(--stroke)] bg-white/90 px-6 py-3 text-sm font-bold text-[var(--ink)] shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-white">
                  Ver ayudas
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {stats.map((stat, index) => (
                  <div key={stat.label} className={`rounded-2xl border border-white/70 bg-white/82 p-3.5 shadow-card backdrop-blur animate-fade-up-delay-${index === 0 ? '1' : '2'}`}>
                    <p className="display-type text-2xl font-black text-[var(--ink)]">{stat.value}</p>
                    <p className="mt-1 text-xs text-[var(--ink-soft)]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="animate-fade-up-delay-1">
            <div className="surface-card flex h-full flex-col gap-4 p-4">
              <div className="rounded-[1.5rem] border border-[rgba(22,112,85,0.20)] bg-[linear-gradient(135deg,rgba(22,112,85,0.12),rgba(255,255,255,0.96))] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Cómo funciona</p>
                <ol className="mt-4 space-y-3">
                  {['Busca promociones por municipio', 'Comprueba requisitos y fechas', 'Guarda oportunidades y prepara documentación'].map((step, index) => (
                    <li key={step} className="flex gap-3 rounded-2xl bg-white/78 p-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--green-700)] text-sm font-black text-white">{index + 1}</span>
                      <span className="text-sm font-semibold text-[var(--ink)]">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href} className="group rounded-2xl border border-[var(--stroke)] bg-white/86 p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-card">
                    <h2 className="display-type text-lg font-black text-[var(--ink)]">{action.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{action.description}</p>
                    <span className="mt-3 inline-flex text-sm font-bold text-[var(--green-700)] transition group-hover:translate-x-1">Ver más</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="surface-card p-4 animate-fade-up-delay-2">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cyan-700)]">Información útil</p>
              <h2 className="display-type mt-1 text-xl font-black text-[var(--ink)]">Noticias y cambios que pueden afectar tu solicitud</h2>
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Oportunidades próximas</p>
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
