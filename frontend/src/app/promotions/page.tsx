import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { PromotionCard } from '@/components/promotion-card';

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

  const query = new URLSearchParams();
  if (municipality) query.set('municipality', municipality);
  if (province) query.set('province', province);
  if (promotionType) query.set('promotionType', promotionType);

  const promotions = await api.getPromotions(query.size ? `?${query.toString()}` : '');

  const detected = promotions.filter((item) =>
    ['detected', 'pending_review'].includes(item.status),
  );
  const published = promotions.filter((item) => item.status === 'published');

  return (
    <main className="shell space-y-6">
      <header className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Promociones y alertas detectadas</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Las promociones pueden publicarse aunque esten incompletas y se actualizan manualmente desde administracion.
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

      <section>
        <h2 className="mb-3 text-xl font-bold text-[var(--ink)]">Detectadas o en revision</h2>
        {detected.length === 0 ? (
          <EmptyState title="Sin detecciones" description="No hay promociones detectadas con los filtros actuales." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {detected.map((promotion) => (
              <div key={promotion.id} className="space-y-2">
                <PromotionCard promotion={promotion} />
                <p className="rounded-lg border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--ink-soft)]">
                  {promotion.statusMessage ||
                    'Estamos analizando esta promocion y actualizando la informacion'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

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
    </main>
  );
}
