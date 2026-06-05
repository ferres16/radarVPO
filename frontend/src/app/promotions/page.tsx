import Link from 'next/link';
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
  const q = typeof sp.q === 'string' ? sp.q : '';

  const query = new URLSearchParams();
  if (municipality) query.set('municipality', municipality);
  if (province) query.set('province', province);
  if (promotionType) query.set('promotionType', promotionType);
  query.set('limit', '24');

  const promotions = await api.getPromotions(`?${query.toString()}`);
  const published = promotions
    .filter((item) => item.type === 'published')
    .filter((item) => {
      if (!q) return true;
      const haystack = `${item.title} ${item.municipality || ''} ${item.province || ''}`.toLowerCase();
      return haystack.includes(q.toLowerCase());
    });

  return (
    <main className="shell space-y-6 pb-10">
      <header className="relative overflow-hidden rounded-[2rem] border border-[var(--stroke)] bg-[linear-gradient(135deg,rgba(22,112,85,0.12),rgba(255,255,255,0.96)_55%,rgba(167,28,32,0.08))] p-5 shadow-card animate-fade-up md:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[rgba(244,197,66,0.18)] blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Buscar vivienda pública</p>
          <h1 className="display-type mt-2 text-3xl font-black tracking-tight text-[var(--ink)] md:text-5xl">
            Encuentra promociones por municipio, provincia y régimen
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--ink-soft)]">
            Resultados limpios, fichas comparables y estados claros para entender si una promoción está revisada o en actualización.
          </p>
        </div>

        <form className="relative mt-6 grid gap-3 rounded-[1.5rem] border border-white/70 bg-white/78 p-3 shadow-sm backdrop-blur md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]" action="/promotions" method="get" aria-label="Filtros de búsqueda de vivienda">
          <label className="text-sm font-semibold text-[var(--ink)]">
            Búsqueda rápida
            <input name="q" defaultValue={q} placeholder="Título, municipio o zona" className="mt-1 w-full rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[var(--green-500)] focus:ring-2 focus:ring-[rgba(78,143,58,0.12)]" />
          </label>
          <label className="text-sm font-semibold text-[var(--ink)]">
            Municipio
            <input name="municipality" defaultValue={municipality} placeholder="Barcelona, Girona..." className="mt-1 w-full rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[var(--green-500)] focus:ring-2 focus:ring-[rgba(78,143,58,0.12)]" />
          </label>
          <label className="text-sm font-semibold text-[var(--ink)]">
            Provincia
            <input name="province" defaultValue={province} placeholder="Barcelona" className="mt-1 w-full rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[var(--green-500)] focus:ring-2 focus:ring-[rgba(78,143,58,0.12)]" />
          </label>
          <label className="text-sm font-semibold text-[var(--ink)]">
            Régimen
            <select name="promotionType" defaultValue={promotionType} className="mt-1 w-full rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[var(--green-500)] focus:ring-2 focus:ring-[rgba(78,143,58,0.12)]">
              <option value="">Todos</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
              <option value="mixto">Mixto</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button className="w-full rounded-2xl bg-[var(--green-700)] px-5 py-3 text-sm font-bold text-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--green-900)] md:w-auto">
              Buscar
            </button>
          </div>
        </form>
      </header>

      <section className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--stroke)] bg-white/82 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between animate-fade-up-delay-1">
        <div>
          <p className="text-sm font-bold text-[var(--ink)]">{published.length} viviendas o promociones encontradas</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Usa filtros cortos y vuelve a comparar sin perder contexto.</p>
        </div>
        <Link href="/promotions" className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
          Limpiar filtros
        </Link>
      </section>

      {published.length === 0 ? (
        <EmptyState title="Sin promociones publicadas" description="Ajusta municipio, provincia o régimen. También puedes activar seguimiento para recibir avisos cuando aparezcan nuevas oportunidades." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Resultados de vivienda">
          {published.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </section>
      )}
    </main>
  );
}
