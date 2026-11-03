'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { PageHero, SurfaceCard } from '@/components/design-system';
import { SkeletonCard } from '@/components/skeleton-card';
import { api } from '@/lib/api';
import type { DeliveryLog, SmsOpsSnapshot, UserProfile } from '@/types';

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function sourceLabel(sourceRef?: string | null) {
  if (!sourceRef) return '—';
  if (sourceRef.startsWith('pro_sms_configured:')) return 'Confirmación PRO';
  if (sourceRef.startsWith('pro_alert:')) return 'Aviso promoción';
  if (sourceRef === 'radar_vpo_pro') return 'Transactional';
  return sourceRef;
}

function SmsTable({ logs, empty }: { logs: DeliveryLog[]; empty: string }) {
  if (logs.length === 0) {
    return <p className="text-sm text-[var(--ink-soft)]">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--stroke)] text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)]">
            <th className="px-2 py-2 font-semibold">Cuándo</th>
            <th className="px-2 py-2 font-semibold">Estado</th>
            <th className="px-2 py-2 font-semibold">Destino</th>
            <th className="px-2 py-2 font-semibold">Tipo</th>
            <th className="px-2 py-2 font-semibold">Error</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-[var(--stroke)] align-top">
              <td className="whitespace-nowrap px-2 py-2">{formatWhen(log.createdAt)}</td>
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
              <td className="px-2 py-2 text-xs text-[var(--ink-soft)]">
                {sourceLabel(log.sourceRef)}
                <span className="mt-1 block break-all opacity-70">{log.sourceRef || ''}</span>
              </td>
              <td className="px-2 py-2 text-xs text-red-800">{log.errorCode || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminSmsPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [data, setData] = useState<SmsOpsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const snapshot = await api.getBackofficeSmsOps();
    setData(snapshot);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const profile = await api.getMe();
        if (!active) return;
        setMe(profile);
        if (profile.role !== 'admin') {
          setError('No tienes permisos de administrador.');
          return;
        }
        await load();
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el control SMS.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [load]);

  async function runAction(
    key: string,
    action: () => Promise<unknown>,
    format: (result: unknown) => string,
  ) {
    setBusy(key);
    setMessage('');
    setError('');
    try {
      const result = await action();
      setMessage(format(result));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La acción falló.');
    } finally {
      setBusy('');
    }
  }

  if (loading) {
    return (
      <main className="shell grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </main>
    );
  }

  if (error && (!me || me.role !== 'admin')) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Control SMS</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{error}</p>
          <Link
            href="/admin"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white"
          >
            Volver al panel
          </Link>
        </article>
      </main>
    );
  }

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-4">
          <PageHero
            eyebrow="Backoffice"
            title="Control SMS"
            description="Estado de Brevo, SMS de confirmación PRO, avisos de promociones y errores de entrega."
            actions={
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  void runAction('reload', load, () => 'Datos actualizados.')
                }
                className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-bold text-[var(--ink)] disabled:opacity-60"
              >
                Actualizar
              </button>
            }
          />

          {error ? (
            <article className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {error}
            </article>
          ) : null}
          {message ? (
            <SurfaceCard className="border-[var(--stroke)] bg-[var(--bg-app)] p-4 text-sm whitespace-pre-line text-[var(--ink)]">
              {message}
            </SurfaceCard>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SurfaceCard className="p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                Brevo
              </p>
              <p className="mt-2 text-lg font-black text-[var(--ink)]">
                {data?.configured ? 'Listo' : 'No configurado'}
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                API key: {data?.hasApiKey ? 'sí' : 'no'} · PRO alerts:{' '}
                {data?.proAlertsEnabled ? 'sí' : 'no'}
              </p>
            </SurfaceCard>
            <SurfaceCard className="p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                SMS 7 días
              </p>
              <p className="mt-2 text-lg font-black text-[var(--ink)]">{data?.sent7d ?? '—'}</p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">Enviados con éxito</p>
            </SurfaceCard>
            <SurfaceCard className="p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                Errores 7 días
              </p>
              <p className="mt-2 text-lg font-black text-[var(--ink)]">{data?.failed7d ?? '—'}</p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">Fallos Brevo / SMS</p>
            </SurfaceCard>
            <SurfaceCard className="p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                PRO con SMS
              </p>
              <p className="mt-2 text-lg font-black text-[var(--ink)]">{data?.proWithSms ?? '—'}</p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                Con móvil: {data?.proWithPhone ?? '—'} · Sin SMS: {data?.proMissingSms ?? '—'}
              </p>
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-3 p-4 md:p-5">
            <h2 className="text-lg font-bold text-[var(--ink)]">Acciones</h2>
            <p className="text-sm leading-6 text-[var(--ink-soft)]">
              El checkbox de «Recibir SMS» en Mi cuenta controla si un PRO recibe avisos de nuevas
              promociones. Al pagar PRO (o al activarlo desde Usuarios) se marca solo y se envía un SMS
              de confirmación. Si ya eras PRO antes, usa «Activar SMS PRO existentes».
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  void runAction(
                    'confirm-me',
                    () => api.confirmMyBackofficeProSms(),
                    (result) => {
                      const r = result as Awaited<ReturnType<typeof api.confirmMyBackofficeProSms>>;
                      return `Tu cuenta: activados ${r.enabled}, SMS enviados ${r.smsSent}, omitidos ${r.skipped}.`;
                    },
                  )
                }
                className="rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {busy === 'confirm-me' ? 'Enviando…' : 'Enviar SMS de configuración a mí'}
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  void runAction(
                    'sync',
                    () => api.syncBackofficeProSms(),
                    (result) => {
                      const r = result as Awaited<ReturnType<typeof api.syncBackofficeProSms>>;
                      return `Sync PRO: revisados ${r.scanned}, con SMS ${r.enabled}, confirmaciones enviadas ${r.smsSent}, omitidos ${r.skipped}.`;
                    },
                  )
                }
                className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-bold text-[var(--ink)] disabled:opacity-60"
              >
                {busy === 'sync' ? 'Sincronizando…' : 'Activar SMS PRO existentes'}
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  void runAction(
                    'dispatch',
                    () => api.dispatchProAlertNotifications(false),
                    (result) => {
                      const r = result as Awaited<
                        ReturnType<typeof api.dispatchProAlertNotifications>
                      >;
                      return `Avisos pendientes: ${r.sent} entregas · pendientes ${r.pendingAlerts} · PRO ${r.proUsers}${
                        r.reason ? ` · ${r.reason}` : ''
                      }.`;
                    },
                  )
                }
                className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-bold text-[var(--ink)] disabled:opacity-60"
              >
                {busy === 'dispatch' ? 'Enviando…' : 'Enviar avisos pendientes'}
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  void runAction(
                    'force',
                    () => api.dispatchProAlertNotifications(true),
                    (result) => {
                      const r = result as Awaited<
                        ReturnType<typeof api.dispatchProAlertNotifications>
                      >;
                      return `Reenvío forzado: ${r.sent} entregas · PRO ${r.proUsers}${
                        r.reason ? ` · ${r.reason}` : ''
                      }.`;
                    },
                  )
                }
                className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-bold text-[var(--ink)] disabled:opacity-60"
              >
                {busy === 'force' ? 'Reenviando…' : 'Forzar reenvío avisos'}
              </button>
            </div>
          </SurfaceCard>

          <SurfaceCard className="space-y-3 p-4 md:p-5">
            <h2 className="text-lg font-bold text-[var(--ink)]">SMS de confirmación PRO</h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Aparecen aquí al pagar PRO, al activar PRO desde Usuarios, o al usar los botones de arriba.
            </p>
            <SmsTable
              logs={data?.confirmationLogs ?? []}
              empty="Todavía no hay SMS de confirmación. Usa «Enviar SMS de configuración a mí» para probar."
            />
          </SurfaceCard>

          <SurfaceCard className="space-y-3 p-4 md:p-5">
            <h2 className="text-lg font-bold text-[var(--ink)]">Errores recientes</h2>
            {(data?.recentFailures.length ?? 0) === 0 ? (
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
                    <span className="mt-1 block text-xs opacity-80">
                      {formatWhen(failure.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SurfaceCard>

          <SurfaceCard className="space-y-3 p-4 md:p-5">
            <h2 className="text-lg font-bold text-[var(--ink)]">Últimos SMS</h2>
            <SmsTable
              logs={data?.logs ?? []}
              empty="Todavía no hay registros en delivery_logs. Aparecerán al enviar SMS."
            />
          </SurfaceCard>
        </div>
      </div>
    </main>
  );
}
