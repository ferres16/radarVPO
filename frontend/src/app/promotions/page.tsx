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
  const promotionType = typeof sp.promotionType === 'string' ? sp.promotionType : '';

  const query = new URLSearchParams();
  if (municipality) query.set('municipality', municipality);
  if (province) query.set('province', province);
  if (promotionType) query.set('promotionType', promotionType);

  const promotions = await api.getPromotions(query.size ? `?${query.toString()}` : '');
  const published = promotions.filter((item) => item.type === 'published').slice(0, 10);

  return (
    <main className="shell space-y-6 pb-10">
      <header className="rounded-[1.75rem] border border-[var(--stroke)] bg-[linear-gradient(135deg,rgba(78,143,58,0.10),rgba(255,255,255,0.96))] p-6 shadow-card animate-fade-up">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Promociones publicadas</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--ink)] md:text-4xl">
            Últimas 10 promociones publicadas
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[var(--ink-soft)]">
            Aquí solo verás promociones ya publicadas, con un máximo de las últimas 10. Las fichas con información en actualización aparecen marcadas con un aviso claro para que sepas si faltan datos por completar.
          </p>
        </div>

        <form className="mt-5 flex flex-wrap gap-2" action="/promotions" method="get">
          <input name="municipality" defaultValue={municipality} placeholder="Municipio" className="rounded-full border border-[var(--stroke)] bg-white/90 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-[var(--green-500)] focus:ring-2 focus:ring-[rgba(78,143,58,0.12)]" />
          <input name="province" defaultValue={province} placeholder="Provincia" className="rounded-full border border-[var(--stroke)] bg-white/90 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-[var(--green-500)] focus:ring-2 focus:ring-[rgba(78,143,58,0.12)]" />
          <select name="promotionType" defaultValue={promotionType} className="rounded-full border border-[var(--stroke)] bg-white/90 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-[var(--green-500)] focus:ring-2 focus:ring-[rgba(78,143,58,0.12)]">
            <option value="">Tipo</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
            <option value="mixto">Mixto</option>
          </select>
          <button className="rounded-full bg-[var(--green-500)] px-5 py-2 text-sm font-semibold text-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--green-700)]">
            Filtrar
          </button>
        </form>
      </header>

      {published.length === 0 ? (
        <EmptyState title="Sin promociones publicadas" description="Aún no hay promociones publicadas que encajen con estos filtros dentro del máximo de 10 resultados." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {published.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </section>
      )}
    </main>
  );
}
