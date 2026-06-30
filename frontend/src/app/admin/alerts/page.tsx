'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { ButtonLink, PageHero, SurfaceCard } from '@/components/design-system';
import { api } from '@/lib/api';
import type { PromotionDetail } from '@/types';

type AlertStatusFilter = 'pending_review' | 'published_unreviewed' | 'published_reviewed' | 'archived' | 'all';

const statusLabels: Record<AlertStatusFilter, string> = {
  pending_review: 'Pendientes',
  published_unreviewed: 'Publicadas sin revisar',
  published_reviewed: 'Publicadas revisadas',
  archived: 'Archivadas',
  all: 'Todas',
};

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<PromotionDetail[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AlertStatusFilter>('pending_review');
  const [savingId, setSavingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [dispatching, setDispatching] = useState(false);

  async function dispatchProNotifications() {
    setDispatching(true);
    setDispatchMessage('');
    try {
      const result = await api.dispatchProAlertNotifications();
      if (result.skipped) {
        setDispatchMessage(
          result.reason === 'brevo_not_configured'
            ? 'Brevo no está activo. Revisa BREVO_API_KEY y BREVO_PRO_ALERTS_ENABLED en Railway.'
            : `Sin envíos: ${result.reason || 'omitido'}`,
        );
      } else {
        setDispatchMessage(`Notificaciones PRO enviadas: ${result.sent} entregas (email/SMS).`);
      }
    } catch (err) {
      setDispatchMessage(err instanceof Error ? err.message : 'No se pudieron enviar las notificaciones');
    } finally {
      setDispatching(false);
    }
  }

  async function load(nextQuery = query, nextStatus = statusFilter) {
    const status = nextStatus === 'all' ? undefined : nextStatus;
    const rows = await api.getBackofficePromotions(status, nextQuery || undefined, 100);
    setAlerts(rows);
  }

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const rows = await api.getBackofficePromotions(statusFilter === 'all' ? undefined : statusFilter, query || undefined, 100);
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
  }, [query, statusFilter]);

  async function updateStatus(id: string, status: 'published_unreviewed' | 'archived') {
    setSavingId(id);
    setError('');
    try {
      const updated = await api.updateBackofficePromotionStatus(id, status);
      setAlerts((prev) =>
        statusFilter === 'all' || updated.status === statusFilter
          ? prev.map((item) => (item.id === id ? { ...item, status: updated.status } : item))
          : prev.filter((item) => item.id !== id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el aviso');
    } finally {
      setSavingId('');
    }
  }

  async function deleteAlert(id: string) {
    if (!window.confirm('Vas a eliminar definitivamente este aviso. ¿Quieres continuar?')) return;
    setSavingId(id);
    setError('');
    try {
      await api.deleteBackofficePromotion(id);
      setAlerts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el aviso');
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
            title="Gestiona avisos detectados y su publicación"
            description="Filtra por estado, revisa cada aviso y decide si publicarlo, marcarlo como revisado, archivarlo o eliminarlo definitivamente."
            actions={
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={dispatching}
                  onClick={() => void dispatchProNotifications()}
                  className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-bold text-[var(--ink)] disabled:opacity-60"
                >
                  {dispatching ? 'Enviando PRO...' : 'Enviar alertas PRO (Brevo)'}
                </button>
                <ButtonLink href="/admin/promotions">Ver promociones publicadas</ButtonLink>
              </div>
            }
          />

          {dispatchMessage ? (
            <SurfaceCard className="border-[var(--stroke)] bg-[var(--bg-app)] p-4 text-sm text-[var(--ink)]">
              {dispatchMessage}
            </SurfaceCard>
          ) : null}

          <SurfaceCard className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusLabels) as AlertStatusFilter[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                    statusFilter === status
                      ? 'bg-[var(--green-700)] text-white'
                      : 'border border-[var(--stroke)] bg-white text-[var(--ink)]'
                  }`}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
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
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">{statusLabels[alert.status as AlertStatusFilter] || alert.status}</p>
                <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)]">{alert.title}</h2>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{alert.municipality || 'Catalunya'} · {alert.promotionType}</p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">Estado actual: {alert.status}</p>
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
                    Archivar
                  </button>
                  <button
                    type="button"
                    disabled={savingId === alert.id}
                    onClick={() => void deleteAlert(alert.id)}
                    className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-60 sm:col-span-3"
                  >
                    Eliminar definitivamente
                  </button>
                </div>
              </article>
            ))}
          </section>

          {!loading && alerts.length === 0 ? (
            <SurfaceCard className="p-6 text-center text-sm text-[var(--ink-soft)]">
              No hay avisos en este filtro. Cambia de estado o espera a que el scraper detecte nuevas oportunidades.
            </SurfaceCard>
          ) : null}
        </div>
      </div>
    </main>
  );
}
