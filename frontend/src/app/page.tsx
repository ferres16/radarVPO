import Link from 'next/link';
import { api } from '@/lib/api';
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

  if (!reference) {
    return null;
  }

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
  const [alerts, news] = await Promise.all([
    api.getUpcomingAlerts().catch(() => []),
    api.getNews().catch(() => []),
  ]);

  const recentNews = news.slice(0, 4);
  const upcoming = alerts
    .map((promotion) => ({ promotion, window: getUpcomingWindow(promotion) }))
    .filter((entry): entry is { promotion: (typeof alerts)[number]; window: NonNullable<ReturnType<typeof getUpcomingWindow>> } => Boolean(entry.window));
  const activeAlerts = upcoming.filter((entry) => entry.window.state === 'active');
  const expiredAlerts = upcoming.filter((entry) => entry.window.state === 'expired');

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
            <Link href="/promotions?view=upcoming" className="rounded-xl border border-[var(--stroke)] bg-white px-5 py-3 font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
              Ver promociones
            </Link>
            <Link href="/services" className="rounded-xl border border-[var(--stroke)] bg-white px-5 py-3 font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
              Servicios
            </Link>
          </div>
        </header>

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl font-bold text-[var(--ink)]">Próximas promociones por salir</h2>
            <Link href="/promotions?view=upcoming" className="text-sm font-semibold text-[var(--green-700)]">Ver más</Link>
          </div>
          {alerts.length === 0 ? (
            <article className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
              <p className="text-sm text-[var(--ink-soft)]">No hay alertas nuevas ahora mismo.</p>
            </article>
          ) : (
            <>
              <div className="mb-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeAlerts.slice(0, 3).map(({ promotion, window }) => (
                  <div key={promotion.id} className="space-y-2">
                    <PromotionCard promotion={promotion} hideDetail hideStatus />
                    <div className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--ink-soft)] shadow-card">
                      Activa: quedan {window.daysLeft} dias.
                    </div>
                  </div>
                ))}
              </div>
              {expiredAlerts.length > 0 ? (
                <div className="mb-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {expiredAlerts.slice(0, 3).map(({ promotion, window }) => (
                    <div key={promotion.id} className="space-y-2 opacity-90">
                        <PromotionCard promotion={promotion} hideDetail hideStatus />
                      <div className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--ink-soft)] shadow-card">
                        Vencida hace {window.daysSince} dias.
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl font-bold text-[var(--ink)]">Noticias vivienda Catalunya</h2>
            <Link href="/dashboard#noticias" className="text-sm font-semibold text-[var(--green-700)]">Ver más</Link>
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
