'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { ButtonLink, PageHero, SurfaceCard } from '@/components/design-system';
import { api } from '@/lib/api';
import type { PromotionDetail } from '@/types';

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<PromotionDetail[]>([]);
  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(nextQuery = query) {
    const rows = await api.getBackofficePromotions('pending_review', nextQuery || undefined, 100);
    setAlerts(rows);
  }

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const rows = await api.getBackofficePromotions('pending_review', query || undefined, 100);
        if (!active) return;
        setAlerts(rows);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar avisos');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [query]);

  async function updateStatus(id: string, status: 'published_unreviewed' | 'archived') {
    setSavingId(id);
    setError('');
    try {
      await api.updateBackofficePromotionStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el aviso');
    } finally {
      setSavingId('');
    }
  }

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-6">
          <PageHero
            eyebrow="Avisos pendientes"
            title="Gestiona avisos antes de convertirlos en promoción"
            description="Los avisos son oportunidades detectadas pendientes de revisión. Cuando ya estén publicadas, pásalas a Publicada sin revisar o archívalas para eliminarlas de la cola."
            actions={<ButtonLink href="/admin/promotions">Ver promociones publicadas</ButtonLink>}
          />

          <SurfaceCard className="p-4">
            <label className="text-sm font-semibold text-[var(--ink)]">
              Buscar avisos
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Municipio, título, promotor..."
                className="ds-control mt-2 w-full"
              />
            </label>
          </SurfaceCard>

          {error ? <SurfaceCard className="border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{error}</SurfaceCard> : null}
          {loading ? <SurfaceCard className="p-5 text-sm text-[var(--ink-soft)]">Cargando avisos...</SurfaceCard> : null}

          <section className="grid gap-4 lg:grid-cols-2">
            {alerts.map((alert) => (
              <article key={alert.id} className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">Aviso pendiente</p>
                <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)]">{alert.title}</h2>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{alert.municipality || 'Catalunya'} · {alert.promotionType}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <Link href={`/admin/promotions/${alert.id}`} className="rounded-2xl border border-[var(--stroke)] px-3 py-2 text-center text-xs font-bold text-[var(--ink)]">
                    Revisar ficha
                  </Link>
                  <button
                    type="button"
                    disabled={savingId === alert.id}
                    onClick={() => void updateStatus(alert.id, 'published_unreviewed')}
                    className="rounded-2xl bg-[var(--green-700)] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                  >
                    Ya publicada
                  </button>
                  <button
                    type="button"
                    disabled={savingId === alert.id}
                    onClick={() => void updateStatus(alert.id, 'archived')}
                    className="rounded-2xl border border-[var(--stroke)] px-3 py-2 text-xs font-bold text-[var(--ink)] disabled:opacity-60"
                  >
                    Eliminar aviso
                  </button>
                </div>
              </article>
            ))}
          </section>

          {!loading && alerts.length === 0 ? (
            <SurfaceCard className="p-6 text-center text-sm text-[var(--ink-soft)]">
              No hay avisos pendientes. Cuando el scraper detecte nuevas oportunidades aparecerán aquí.
            </SurfaceCard>
          ) : null}
        </div>
      </div>
    </main>
  );
}
