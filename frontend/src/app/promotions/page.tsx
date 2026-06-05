import Link from 'next/link';
import { api } from '@/lib/api';
import { PromotionCard } from '@/components/promotion-card';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';

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
  query.set('limit', '10');

  const promotions = await api.getPromotions(`?${query.toString()}`).catch(() => []);
  const published = promotions
    .filter((item) => item.type === 'published')
    .filter((item) => {
      if (!q) return true;
      const haystack = `${item.title} ${item.municipality || ''} ${item.province || ''}`.toLowerCase();
      return haystack.includes(q.toLowerCase());
    });

  return (
    <main className="shell space-y-6 pb-10">
      <PageHero
        eyebrow="Promociones publicadas"
        title="Las 10 oportunidades de vivienda pública más recientes"
        description="Consulta promociones publicadas, revisa su estado y entra rápido en la ficha oficial. Sin filtros aplicados mostramos automáticamente las últimas 10."
        actions={
          <>
            <ButtonLink href="/alerts">Ver avisos</ButtonLink>
            <ButtonLink href="/services" variant="secondary">Explorar servicios</ButtonLink>
          </>
        }
      />

      <SurfaceCard className="p-4">
        <form className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]" action="/promotions" method="get" aria-label="Filtros de búsqueda de vivienda">
          <label className="text-sm font-semibold text-[var(--ink)]">
            Búsqueda rápida
            <input name="q" defaultValue={q} placeholder="Título, municipio o zona" className="ds-control mt-1 w-full" />
          </label>
          <label className="text-sm font-semibold text-[var(--ink)]">
            Municipio
            <input name="municipality" defaultValue={municipality} placeholder="Barcelona, Girona..." className="ds-control mt-1 w-full" />
          </label>
          <label className="text-sm font-semibold text-[var(--ink)]">
            Provincia
            <input name="province" defaultValue={province} placeholder="Barcelona" className="ds-control mt-1 w-full" />
          </label>
          <label className="text-sm font-semibold text-[var(--ink)]">
            Régimen
            <select name="promotionType" defaultValue={promotionType} className="ds-control mt-1 w-full">
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
      </SurfaceCard>

      <section className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--stroke)] bg-white/82 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--ink)]">{published.length} promociones mostradas</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{q || municipality || province || promotionType ? 'Resultados filtrados.' : 'Últimas 10 promociones publicadas automáticamente.'}</p>
        </div>
        <Link href="/promotions" className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
          Limpiar filtros
        </Link>
      </section>

      {published.length === 0 ? (
        <SurfaceCard className="p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Sin promociones disponibles</p>
          <h2 className="display-type mt-3 text-3xl font-black text-[var(--ink)]">No hay promociones publicadas que mostrar ahora mismo</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            Puedes consultar avisos próximos o contratar seguimiento para que te avisemos cuando aparezcan nuevas oportunidades.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/alerts">Consultar avisos</ButtonLink>
            <ButtonLink href="/services" variant="secondary">Explorar servicios</ButtonLink>
          </div>
        </SurfaceCard>
      ) : (
        <section className="space-y-4">
        <SectionHeader title="Últimas promociones" description="Fichas recientes con ubicación, estado y acceso directo al detalle." />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Resultados de vivienda">
          {published.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </section>
        </section>
      )}
    </main>
  );
}
