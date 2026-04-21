import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { PromotionCard } from '@/components/promotion-card';
import type { Promotion } from '@/types';

function parseDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getUpcomingWindow(promotion: Promotion) {
  const reference = parseDate(promotion.estimatedPublicationDate) ?? parseDate(promotion.publishedAt) ?? parseDate(promotion.alertDetectedAt);
  if (!reference) return null;

  const msLeft = reference.getTime() - Date.now();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  if (daysLeft >= 0 && daysLeft <= 60) {
    return { state: 'active' as const, daysLeft };
  }

  const daysSince = Math.floor((Date.now() - reference.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince >= 60 && daysSince <= 67) {
    return { state: 'expired' as const, daysSince };
  }

  return null;
}

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const municipality = typeof sp.municipality === 'string' ? sp.municipality : '';
  const province = typeof sp.province === 'string' ? sp.province : '';
  const promotionType =
    typeof sp.promotionType === 'string' ? sp.promotionType : '';
  const view = typeof sp.view === 'string' ? sp.view : 'published';

  const query = new URLSearchParams();
  if (municipality) query.set('municipality', municipality);
  if (province) query.set('province', province);
  if (promotionType) query.set('promotionType', promotionType);

  const promotions = await api.getPromotions(query.size ? `?${query.toString()}` : '');

  const upcoming = promotions
    .filter((item) => ['detected', 'pending_review'].includes(item.status))
    .map((item) => ({ promotion: item, window: getUpcomingWindow(item) }))
    .filter((entry): entry is { promotion: Promotion; window: NonNullable<ReturnType<typeof getUpcomingWindow>> } => Boolean(entry.window))
    .sort((a, b) => {
      const aReference = parseDate(a.promotion.estimatedPublicationDate) ?? parseDate(a.promotion.publishedAt) ?? parseDate(a.promotion.alertDetectedAt) ?? new Date(0);
      const bReference = parseDate(b.promotion.estimatedPublicationDate) ?? parseDate(b.promotion.publishedAt) ?? parseDate(b.promotion.alertDetectedAt) ?? new Date(0);
      return bReference.getTime() - aReference.getTime();
    });

  const published = promotions
    .filter((item) => item.status === 'published' || item.status === 'pending_review')
    .sort((a, b) => {
      const aDate = parseDate(a.publishedAt) ?? parseDate(a.createdAt) ?? new Date(0);
      const bDate = parseDate(b.publishedAt) ?? parseDate(b.createdAt) ?? new Date(0);
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 10);

  return (
    <main className="shell space-y-6">
      <header className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">
          {view === 'upcoming' ? 'Próximas promociones por salir' : 'Últimos anuncios publicados'}
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          {view === 'upcoming'
            ? 'Mostramos alertas activas con margen de vencimiento y avisos expirados dentro de una semana de gracia.'
            : 'Mostramos solo los últimos anuncios ya publicados, con un máximo de 10.'}
        </p>
        <form className="mt-4 flex flex-wrap gap-2" action="/promotions" method="get">
          <input
            name="municipality"
            defaultValue={municipality}
            placeholder="Municipio"
            className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm"
          />
          <input
            name="province"
            defaultValue={province}
            placeholder="Provincia"
            className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm"
          />
          <select
            name="promotionType"
            defaultValue={promotionType}
            className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm"
          >
            <option value="">Tipo</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
            <option value="mixto">Mixto</option>
          </select>
          <button className="rounded-full bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white">
            Filtrar
          </button>
        </form>
      </header>

      {view === 'upcoming' ? (
        <section>
          <h2 className="mb-3 text-xl font-bold text-[var(--ink)]">Alertas activas</h2>
          {upcoming.filter((entry) => entry.window.state === 'active').length === 0 ? (
            <EmptyState title="Sin alertas activas" description="No hay promociones dentro del plazo de 60 dias o menos." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcoming
                .filter((entry) => entry.window.state === 'active')
                .map(({ promotion, window }) => (
                  <div key={promotion.id} className="space-y-2">
                    <PromotionCard promotion={promotion} hideDetail />
                    <p className="rounded-lg border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--ink-soft)] shadow-card">
                      Quedan {window.daysLeft} dias para el vencimiento estimado.
                    </p>
                  </div>
                ))}
            </div>
          )}

          <h2 className="mb-3 mt-6 text-xl font-bold text-[var(--ink)]">Vencidas</h2>
          {upcoming.filter((entry) => entry.window.state === 'expired').length === 0 ? (
            <EmptyState title="Sin vencidas" description="No hay alertas dentro del margen de una semana." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcoming
                .filter((entry) => entry.window.state === 'expired')
                .map(({ promotion, window }) => (
                  <div key={promotion.id} className="space-y-2 opacity-90">
                    <PromotionCard promotion={promotion} hideDetail />
                    <p className="rounded-lg border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--ink-soft)] shadow-card">
                      Vencida hace {window.daysSince} dias. Sigue visible por margen de gracia.
                    </p>
                  </div>
                ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          <h2 className="mb-3 text-xl font-bold text-[var(--ink)]">Publicadas</h2>
          {published.length === 0 ? (
            <EmptyState title="Sin publicaciones" description="Todavia no hay promociones publicadas para los filtros actuales." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {published.map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
