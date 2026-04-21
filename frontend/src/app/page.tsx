import Link from 'next/link';
import { api } from '@/lib/api';
import { MobileNav } from '@/components/mobile-nav';
import { NewsCard } from '@/components/news-card';
import { PromotionCard } from '@/components/promotion-card';

export default async function Home() {
  const [alerts, news] = await Promise.all([
    api.getUpcomingAlerts().catch(() => []),
    api.getNews().catch(() => []),
  ]);

  const recentNews = news.slice(0, 4);

  return (
    <div className="hero-bg min-h-screen pb-20 md:pb-0">
      <main className="shell">
        <header className="rounded-3xl border border-[var(--stroke)] bg-white/90 p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--green-700)]">Radar VPO</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[var(--ink)] md:text-5xl">
            Alertas detectadas y promociones de vivienda publica en Catalunya.
          </h1>
          <p className="mt-3 max-w-xl text-base text-[var(--ink-soft)]">
            Mostramos promociones desde el primer aviso, incluso cuando todavia faltan datos. El equipo de administracion completa la ficha manualmente.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-xl bg-[var(--green-500)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--green-700)]">
              Crear cuenta gratis
            </Link>
            <Link href="/promotions" className="rounded-xl border border-[var(--stroke)] bg-white px-5 py-3 font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
              Ver promociones
            </Link>
          </div>
        </header>

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl font-bold text-[var(--ink)]">Promociones detectadas</h2>
            <Link href="/promotions" className="text-sm font-semibold text-[var(--green-700)]">Ver todas</Link>
          </div>
          {alerts.length === 0 ? (
            <article className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
              <p className="text-sm text-[var(--ink-soft)]">No hay alertas nuevas ahora mismo.</p>
            </article>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {alerts.slice(0, 6).map((promotion) => (
                <div key={promotion.id} className="space-y-2">
                  <PromotionCard promotion={promotion} hideDetail />
                  <div className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--ink-soft)] shadow-card">
                    {promotion.statusMessage || 'Estamos analizando esta promocion y actualizando la informacion'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl font-bold text-[var(--ink)]">Noticias vivienda Catalunya</h2>
            <Link href="/dashboard" className="text-sm font-semibold text-[var(--green-700)]">Ver mas</Link>
          </div>
          {recentNews.length === 0 ? (
            <article className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
              <p className="text-sm text-[var(--ink-soft)]">Todavia no hay noticias publicadas.</p>
            </article>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recentNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
