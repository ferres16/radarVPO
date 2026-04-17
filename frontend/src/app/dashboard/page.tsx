import Link from 'next/link';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { MobileNav } from '@/components/mobile-nav';
import { NewsCard } from '@/components/news-card';
import { PromotionCard } from '@/components/promotion-card';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const municipality = typeof sp.municipality === 'string' ? sp.municipality : '';
  const promotionType = typeof sp.promotionType === 'string' ? sp.promotionType : '';
  const query = new URLSearchParams();

  if (municipality) query.set('municipality', municipality);
  if (promotionType) query.set('promotionType', promotionType);

  const [promotions, upcoming, news] = await Promise.all([
    api.getPromotions(query.size ? `?${query.toString()}` : ''),
    api.getUpcomingAlerts(),
    api.getNews(),
  ]);

  return (
    <div className="pb-20 md:pb-0">
      <main className="shell space-y-6">
        <header className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Dashboard Radar VPO</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Promociones activas, alertas upcoming y noticias relevantes.</p>
          <form className="mt-4 flex flex-wrap gap-2" action="/dashboard" method="get">
            <input
              name="municipality"
              defaultValue={municipality}
              placeholder="Municipio"
              className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
            />
            <select
              name="promotionType"
              defaultValue={promotionType}
              className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
            >
              <option value="">Tipo</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
              <option value="mixto">Mixto</option>
            </select>
            <button className="rounded-full bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">Filtrar</button>
            <Link href="/favorites" className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">Favoritos</Link>
          </form>
        </header>

        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--ink)]">Promociones</h2>
          {promotions.length === 0 ? (
            <EmptyState title="Sin resultados" description="Ajusta filtros para encontrar promociones en tu zona." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {promotions.map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--ink)]">Alertas de proximos lanzamientos</h2>
          {upcoming.length === 0 ? (
            <EmptyState title="Sin alertas upcoming" description="Todavia no hay publicaciones futuras detectadas." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--ink)]">Noticias</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
