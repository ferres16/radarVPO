import Link from 'next/link';
import { api } from '@/lib/api';

export default async function AdminPage() {
  const [overview, promotions] = await Promise.all([
    api.getBackofficeOverview(),
    api.getBackofficePromotions(),
  ]);

  const grouped = {
    detected: promotions.filter((p) => p.status === 'detected'),
    pending_review: promotions.filter((p) => p.status === 'pending_review'),
    published: promotions.filter((p) => p.status === 'published'),
    archived: promotions.filter((p) => p.status === 'archived'),
  };

  return (
    <main className="shell space-y-6">
      <header className="rounded-3xl border border-[var(--stroke)] bg-gradient-to-r from-emerald-50 via-lime-50 to-white p-6 shadow-card">
        <h1 className="text-3xl font-bold text-[var(--ink)]">Panel de administracion</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Flujo simplificado sin IA: deteccion, revision manual, publicacion y archivo.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {Object.entries(overview).map(([key, value]) => (
          <article key={key} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
            <p className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">{key}</p>
            <p className="mt-2 text-2xl font-bold text-[var(--ink)]">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {(
          ['detected', 'pending_review', 'published', 'archived'] as const
        ).map((status) => (
          <article key={status} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
            <h2 className="text-lg font-semibold capitalize text-[var(--ink)]">
              {status.replace('_', ' ')} ({grouped[status].length})
            </h2>
            <div className="mt-3 space-y-2">
              {grouped[status].slice(0, 8).map((promotion) => (
                <div key={promotion.id} className="rounded-xl border border-[var(--stroke)] p-3 text-sm">
                  <p className="font-semibold text-[var(--ink)]">{promotion.title}</p>
                  <p className="text-[var(--ink-soft)]">
                    {promotion.municipality || 'Catalunya'} - {promotion.promotionType}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">
                    {promotion.statusMessage || 'Pendiente de revision'}
                  </p>
                  <Link
                    href={`/admin/promotions/${promotion.id}`}
                    className="mt-2 inline-flex rounded-lg bg-[var(--green-500)] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Editar ficha
                  </Link>
                </div>
              ))}
              {grouped[status].length === 0 ? (
                <p className="text-sm text-[var(--ink-soft)]">Sin promociones en este estado.</p>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Flujo operativo</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          {['Detectada', 'Pendiente de revision', 'Publicada', 'Archivada'].map((step) => (
            <div key={step} className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3 text-sm">
              {step}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
