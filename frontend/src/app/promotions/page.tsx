import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { PromotionCard } from '@/components/promotion-card';

function extractHomesCount(text?: string | null): number | null {
  if (!text) return null;
  const match = text.match(/(\d{1,4})\s+(habitatges|viviendas|vivendes)/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatTypeLabel(type: string) {
  if (type === 'venta') return 'venta';
  if (type === 'alquiler') return 'alquiler';
  if (type === 'mixto') return 'mixto';
  return 'tipo desconocido';
}

function buildCardTitle(promotion: {
  municipality?: string | null;
  promotionType: string;
  rawText?: string | null;
  title: string;
}) {
  const municipality = promotion.municipality || 'Catalunya';
  const homes = extractHomesCount(promotion.rawText || promotion.title);
  const homesText = homes === null ? 'n/d' : String(homes);

  return `Promocion en ${municipality} de tipo ${formatTypeLabel(
    promotion.promotionType,
  )} con un total de ${homesText} viviendas`;
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
  const status = typeof sp.status === 'string' ? sp.status : '';

  const query = new URLSearchParams();
  if (municipality) query.set('municipality', municipality);
  if (province) query.set('province', province);
  if (promotionType) query.set('promotionType', promotionType);
  if (status) query.set('status', status);

  const promotions = await api.getPromotions(
    query.size ? `?${query.toString()}` : '',
  );

  return (
    <main className="shell">
      <header className="mb-5 rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Todas las promociones</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Listado completo de promociones publicadas y upcoming.</p>
        <form className="mt-4 flex flex-wrap gap-2" action="/promotions" method="get">
          <input
            name="municipality"
            defaultValue={municipality}
            placeholder="Municipio"
            className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
          />
          <input
            name="province"
            defaultValue={province}
            placeholder="Provincia"
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
          <select
            name="status"
            defaultValue={status}
            className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
          >
            <option value="">Estado</option>
            <option value="open">Open</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
          </select>
          <button className="rounded-full bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">
            Filtrar
          </button>
        </form>
      </header>

      {promotions.length === 0 ? (
        <EmptyState title="Sin promociones" description="Todavia no hay promociones disponibles." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              titleOverride={buildCardTitle(promotion)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
