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
  const q = typeof sp.q === 'string' ? sp.q : '';

  const query = new URLSearchParams();
  if (q) query.set('q', q);
  query.set('limit', '10');

  const promotions = await api.getPromotions(`?${query.toString()}`).catch(() => []);
  const visiblePromotions = promotions.filter((item) => item.status !== 'archived');

  return (
    <main className="shell space-y-6 pb-10">
      <PageHero
        eyebrow="Oportunidades recientes"
        title="Las 10 oportunidades de vivienda pública más recientes"
        description="Consulta las promociones y avisos de vivienda más recientes, revisa su estado y entra rápido en la ficha oficial. Sin filtros aplicados mostramos automáticamente las últimas 10."
        actions={
          <>
            <ButtonLink href="/alerts">Ver avisos</ButtonLink>
            <ButtonLink href="/services" variant="secondary">Explorar servicios</ButtonLink>
          </>
        }
      />

      <SurfaceCard className="p-4">
        <form className="grid gap-3 md:grid-cols-[1fr_auto]" action="/promotions" method="get" aria-label="Buscar promociones">
          <label className="text-sm font-semibold text-[var(--ink)]">
            Buscar por palabras de la promoción
            <input name="q" defaultValue={q} placeholder="Ej: Barcelona alquiler cooperativa sorteo..." className="ds-control mt-1 w-full" />
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
          <p className="text-sm font-bold text-[var(--ink)]">{visiblePromotions.length} promociones mostradas</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{q ? 'Resultados filtrados por búsqueda general.' : 'Últimas 10 oportunidades activas automáticamente.'}</p>
        </div>
        <Link href="/promotions" className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
          Limpiar filtros
        </Link>
      </section>

      {visiblePromotions.length === 0 ? (
        <SurfaceCard className="p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Sin oportunidades disponibles</p>
          <h2 className="display-type mt-3 text-3xl font-black text-[var(--ink)]">No hay promociones o avisos que mostrar ahora mismo</h2>
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
          {visiblePromotions.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </section>
        </section>
      )}
    </main>
  );
}
