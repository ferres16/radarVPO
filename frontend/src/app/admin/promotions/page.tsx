import Link from 'next/link';
import { AdminNav } from '@/components/admin-nav';
import { ButtonLink } from '@/components/design-system';
import { api } from '@/lib/api';
import { CreatePromotionForm } from './create-promotion-form';
import { DeletePromotionButton } from './delete-promotion-button';

export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage({
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
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-6">
          <header className="rounded-[1.5rem] border border-[var(--stroke)] bg-white p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">CMS de promociones</p>
            <h1 className="display-type mt-2 text-3xl font-black text-[var(--ink)]">Promociones en la web</h1>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Las mismas {visiblePromotions.length} promociones visibles en{' '}
              <Link href="/promotions" className="font-semibold text-[var(--green-700)] underline">
                /promotions
              </Link>
              .
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href="/promotions" variant="secondary">
                Ver web pública
              </ButtonLink>
              <ButtonLink href="/admin/alerts" variant="secondary">
                Gestionar avisos
              </ButtonLink>
            </div>
          </header>

          <section className="rounded-[1.5rem] border border-[var(--stroke)] bg-white p-4 shadow-card">
            <form method="get" action="/admin/promotions" className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar (igual que en /promotions)"
                className="ds-control"
              />
              <button
                type="submit"
                className="rounded-2xl border border-[var(--stroke)] bg-white px-5 py-3 text-sm font-bold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
              >
                Buscar
              </button>
            </form>
            <CreatePromotionForm />
          </section>

          {visiblePromotions.length === 0 ? (
            <section className="rounded-[1.5rem] border border-[var(--stroke)] bg-white p-6 text-center shadow-card">
              <h2 className="display-type text-2xl font-black text-[var(--ink)]">No hay promociones publicadas</h2>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">La API no devolvió resultados con los criterios actuales.</p>
            </section>
          ) : (
            <ul className="grid list-none gap-4 p-0 lg:grid-cols-2">
              {visiblePromotions.map((promotion) => (
                <li
                  key={promotion.id}
                  className="rounded-[1.5rem] border border-[var(--stroke)] bg-white p-5 shadow-card"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">
                    {promotion.status}
                  </p>
                  <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)]">{promotion.title}</h2>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    {promotion.municipality || 'Catalunya'} · {promotion.promotionType}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/promotions/${promotion.id}`}
                      className="rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--green-900)]"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/promotions/${promotion.id}`}
                      className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-bold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
                    >
                      Ver pública
                    </Link>
                    <DeletePromotionButton promotionId={promotion.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
