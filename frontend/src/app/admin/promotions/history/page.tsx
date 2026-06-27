'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { ButtonLink, PageHero, SurfaceCard } from '@/components/design-system';
import { api } from '@/lib/api';
import type { PromotionDetail } from '@/types';

const statusLabels: Record<PromotionDetail['status'], string> = {
  pending_review: 'Aviso pendiente',
  published_unreviewed: 'Publicada sin revisar',
  published_reviewed: 'Publicada revisada',
  archived: 'Archivada',
};

export default function AdminPromotionHistoryPage() {
  const [promotions, setPromotions] = useState<PromotionDetail[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const rows = await api.getBackofficePromotions(undefined, query || undefined, 500, 0);
        if (!active) return;
        setPromotions(rows);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el histórico');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [query]);

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-6">
          <PageHero
            eyebrow="Histórico"
            title="Resto de promociones fuera de la bandeja diaria"
            description="Aquí queda todo lo que no entra en las 10 promociones principales para no saturar la gestión diaria."
            actions={<ButtonLink href="/admin/promotions">Volver a las 10 principales</ButtonLink>}
          />

          <SurfaceCard className="p-4">
            <label className="text-sm font-semibold text-[var(--ink)]">
              Buscar en histórico
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Título, municipio, promotor..."
                className="ds-control mt-2 w-full"
              />
            </label>
          </SurfaceCard>

          {error ? <SurfaceCard className="border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{error}</SurfaceCard> : null}
          {loading ? <SurfaceCard className="p-5 text-sm text-[var(--ink-soft)]">Cargando histórico...</SurfaceCard> : null}

          <section className="grid gap-4 lg:grid-cols-2">
            {promotions.map((promotion) => (
              <article key={promotion.id} className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">{statusLabels[promotion.status]}</p>
                <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)]">{promotion.title}</h2>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{promotion.municipality || 'Catalunya'} · {promotion.promotionType}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/promotions/${promotion.id}`} className="rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-bold text-white">
                    Editar
                  </Link>
                  <Link href={`/promotions/${promotion.id}`} className="rounded-full border border-[var(--stroke)] px-4 py-2 text-sm font-bold text-[var(--ink)]">
                    Ver pública
                  </Link>
                </div>
              </article>
            ))}
          </section>

          {!loading && promotions.length === 0 ? (
            <SurfaceCard className="p-6 text-center text-sm text-[var(--ink-soft)]">
              No hay promociones en histórico con estos criterios.
            </SurfaceCard>
          ) : null}
        </div>
      </div>
    </main>
  );
}
