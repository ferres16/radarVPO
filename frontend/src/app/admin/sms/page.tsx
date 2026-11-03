'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { PageHero, SurfaceCard } from '@/components/design-system';
import { api } from '@/lib/api';
import type { SmsOpsSnapshot } from '@/types';

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export default function AdminSmsPage() {
  const [data, setData] = useState<SmsOpsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchMessage, setDispatchMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const snapshot = await api.getBackofficeSmsOps();
      setData(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el control SMS.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function dispatchAlerts(force: boolean) {
    setDispatching(true);
    setDispatchMessage('');
    try {
      const result = await api.dispatchProAlertNotifications(force);
      setDispatchMessage(
        `Envío: ${result.sent} entregas · pendientes ${result.pendingAlerts} · PRO ${result.proUsers} (móvil ${result.proUsersWithPhone}). ${
          result.reason ? `Motivo: ${result.reason}.` : ''
        }`,
      );
      await load();
    } catch (err) {
      setDispatchMessage(err instanceof Error ? err.message : 'Falló el envío de avisos.');
    } finally {
      setDispatching(false);
    }
  }

  return (
    <div className="admin-layout">
      <AdminNav />
      <div className="admin-content space-y-6">
        <PageHero
          eyebrow="Operación"
          title="Control SMS"
          description="Estado de Brevo, SMS enviados a PRO, errores y reenvío de avisos de nuevas promociones."
        />

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SurfaceCard className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">Brevo</p>
            <p className="mt-2 text-lg font-black text-[var(--ink)]">
              {data?.configured ? 'Listo' : 'No configurado'}
            </p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">
              API key: {data?.hasApiKey ? 'sí' : 'no'} · PRO alerts:{' '}
              {data?.proAlertsEnabled ? 'sí' : 'no'}
            </p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">SMS 7 días</p>
            <p className="mt-2 text-lg font-black text-[var(--ink)]">{data?.sent7d ?? '—'}</p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">Enviados con éxito</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">Errores 7 días</p>
            <p className="mt-2 text-lg font-black text-[var(--ink)]">{data?.failed7d ?? '—'}</p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">Fallos Brevo / SMS</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">PRO con SMS</p>
            <p className="mt-2 text-lg font-black text-[var(--ink)]">{data?.proWithSms ?? '—'}</p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">
              Con móvil en cuenta: {data?.proWithPhone ?? '—'}
            </p>
          </SurfaceCard>
        </div>

        <SurfaceCard className="space-y-3 p-4 md:p-5">
          <h2 className="text-lg font-bold text-[var(--ink)]">Avisos de promociones</h2>
          <p className="text-sm text-[var(--ink-soft)]">
            Al pagar PRO se activa el SMS automáticamente y se envía un SMS de configuración. Aquí puedes
            forzar el envío de avisos pendientes.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn--primary"
              disabled={dispatching || loading}
              onClick={() => void dispatchAlerts(false)}
            >
              {dispatching ? 'Enviando…' : 'Enviar avisos pendientes'}
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              disabled={dispatching || loading}
              onClick={() => void dispatchAlerts(true)}
            >
              Forzar reenvío
            </button>
            <button type="button" className="btn btn--secondary" disabled={loading} onClick={() => void load()}>
              Actualizar
            </button>
          </div>
          {dispatchMessage ? (
            <p className="whitespace-pre-wrap rounded-xl bg-[var(--bg-app)] px-3 py-2 text-sm text-[var(--ink)]">
              {dispatchMessage}
            </p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-3 p-4 md:p-5">
          <h2 className="text-lg font-bold text-[var(--ink)]">Errores recientes</h2>
          {loading && !data ? (
            <p className="text-sm text-[var(--ink-soft)]">Cargando…</p>
          ) : (data?.recentFailures.length ?? 0) === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">Sin errores recientes de SMS/email PRO.</p>
          ) : (
            <ul className="space-y-2">
              {data?.recentFailures.map((failure, index) => (
                <li
                  key={`${failure.createdAt}-${failure.target}-${index}`}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                >
                  <span className="font-semibold">[{failure.channel}]</span> {failure.target}:{' '}
                  {failure.errorCode}
                  <span className="mt-1 block text-xs opacity-80">{formatWhen(failure.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-3 p-4 md:p-5">
          <h2 className="text-lg font-bold text-[var(--ink)]">Últimos SMS</h2>
          {loading && !data ? (
            <p className="text-sm text-[var(--ink-soft)]">Cargando…</p>
          ) : (data?.logs.length ?? 0) === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">
              Todavía no hay registros en delivery_logs. Aparecerán al enviar SMS (avisos o confirmación PRO).
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--stroke)] text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                    <th className="px-2 py-2 font-semibold">Cuándo</th>
                    <th className="px-2 py-2 font-semibold">Estado</th>
                    <th className="px-2 py-2 font-semibold">Destino</th>
                    <th className="px-2 py-2 font-semibold">Origen</th>
                    <th className="px-2 py-2 font-semibold">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.logs.map((log) => (
                    <tr key={log.id} className="border-b border-[var(--stroke)] align-top">
                      <td className="px-2 py-2 whitespace-nowrap">{formatWhen(log.createdAt)}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            log.status === 'sent'
                              ? 'bg-[rgba(22,112,85,0.12)] text-[var(--green-700)]'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 font-mono text-xs">{log.target}</td>
                      <td className="px-2 py-2 text-xs text-[var(--ink-soft)]">{log.sourceRef || '—'}</td>
                      <td className="px-2 py-2 text-xs text-red-800">{log.errorCode || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
