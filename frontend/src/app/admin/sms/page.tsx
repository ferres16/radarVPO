'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { PageHero, SurfaceCard } from '@/components/design-system';
import { SkeletonCard } from '@/components/skeleton-card';
import { api } from '@/lib/api';
import type { DeliveryLog, SmsOpsSnapshot, UpcomingDelivery, UserProfile } from '@/types';

type ChannelFilter = 'all' | 'sms' | 'email';
type StatusFilter = 'all' | 'sent' | 'failed';

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function kindLabel(kind: UpcomingDelivery['kind']) {
  const labels: Record<UpcomingDelivery['kind'], string> = {
    new_alert: 'Nueva alerta',
    new_publication: 'Publicación oficial',
    reminder_7d: 'Recordatorio 7 días',
    reminder_1d: 'Recordatorio 1 día',
  };
  return labels[kind];
}

function stateLabel(state: UpcomingDelivery['state']) {
  if (state === 'ready') return 'Listo ahora';
  if (state === 'scheduled') return 'Programado';
  return 'Ventana pasada';
}

function sourceLabel(sourceRef?: string | null) {
  if (!sourceRef) return '—';
  if (sourceRef.startsWith('pro_sms_configured:')) return 'Confirmación PRO (SMS)';
  if (sourceRef.startsWith('pro_alert:')) {
    const kind = sourceRef.split(':')[1] || '';
    const labels: Record<string, string> = {
      new_alert: 'Aviso nueva alerta',
      new_publication: 'Aviso publicación',
      reminder_7d: 'Recordatorio 7 días',
      reminder_1d: 'Recordatorio 1 día',
    };
    return labels[kind] || 'Aviso PRO';
  }
  if (sourceRef.startsWith('email:')) {
    const key = sourceRef.slice('email:'.length);
    const labels: Record<string, string> = {
      'purchase.pro': 'Compra PRO',
      'purchase.pro_pack': 'Compra pack PRO',
      'purchase.guide': 'Compra guía',
      'auth.password_reset': 'Reset contraseña',
      'cancel.pro_user': 'Baja PRO confirmada',
      'cancel.pro_user_requested': 'Solicitud baja PRO',
      'cancel.pro_admin': 'Aviso baja (admin)',
    };
    return labels[key] || `Email · ${key}`;
  }
  if (sourceRef === 'radar_vpo_pro') return 'Transactional';
  return sourceRef;
}

function recipientLabel(log: DeliveryLog) {
  const name = log.recipientName?.trim();
  if (name && log.recipientEmail && log.channel === 'sms') {
    return `${name} · ${log.target}`;
  }
  if (name) return `${name} · ${log.target}`;
  return log.target;
}

function DeliveryTable({ logs, empty }: { logs: DeliveryLog[]; empty: string }) {
  if (logs.length === 0) {
    return <p className="text-sm text-[var(--ink-soft)]">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--stroke)] text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)]">
            <th className="px-2 py-2 font-semibold">Cuándo</th>
            <th className="px-2 py-2 font-semibold">Canal</th>
            <th className="px-2 py-2 font-semibold">Estado</th>
            <th className="px-2 py-2 font-semibold">Destinatario</th>
            <th className="px-2 py-2 font-semibold">Tipo</th>
            <th className="px-2 py-2 font-semibold">Error</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-[var(--stroke)] align-top">
              <td className="whitespace-nowrap px-2 py-2">{formatWhen(log.createdAt)}</td>
              <td className="px-2 py-2">
                <span className="rounded-full bg-[var(--bg-app)] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[var(--ink)]">
                  {log.channel}
                </span>
              </td>
              <td className="px-2 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    log.status === 'sent'
                      ? 'bg-[rgba(22,112,85,0.12)] text-[var(--green-700)]'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {log.status === 'sent' ? 'enviado' : 'fallido'}
                </span>
              </td>
              <td className="px-2 py-2">
                <span className="font-semibold text-[var(--ink)]">{recipientLabel(log)}</span>
                {log.recipientUserId ? (
                  <Link
                    href={`/admin/users?q=${encodeURIComponent(log.recipientEmail || log.target)}`}
                    className="mt-1 block text-xs font-semibold text-[var(--green-700)]"
                  >
                    Ver usuario
                  </Link>
                ) : null}
              </td>
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
  const [channel, setChannel] = useState<ChannelFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    const snapshot = await api.getBackofficeSmsOps({
      channel,
      status,
      q: query,
      limit: 150,
    });
    setData(snapshot);
  }, [channel, status, query]);

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
        setError(err instanceof Error ? err.message : 'No se pudo cargar el control de envíos.');
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
          <h1 className="text-2xl font-bold text-[var(--ink)]">Control de envíos</h1>
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
            title="Control de envíos"
            description="Historial de SMS y correos enviados por Brevo: destinatario, tipo, estado y errores."
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
                Email 7 días
              </p>
              <p className="mt-2 text-lg font-black text-[var(--ink)]">
                {data?.emailSent7d ?? '—'}
                <span className="ml-2 text-sm font-semibold text-red-700">
                  / {data?.emailFailed7d ?? 0} fallos
                </span>
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">Correos enviados con éxito</p>
            </SurfaceCard>
            <SurfaceCard className="p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                SMS 7 días
              </p>
              <p className="mt-2 text-lg font-black text-[var(--ink)]">
                {data?.smsSent7d ?? data?.sent7d ?? '—'}
                <span className="ml-2 text-sm font-semibold text-red-700">
                  / {data?.smsFailed7d ?? data?.failed7d ?? 0} fallos
                </span>
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">SMS enviados con éxito</p>
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
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[var(--ink)]">Próximos envíos previstos</h2>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  Previsión según alertas pendientes y fechas estimadas. Destinatarios estimados:{' '}
                  <strong>{data?.upcoming?.emailRecipients ?? data?.proUsers ?? 0} emails</strong>
                  {' · '}
                  <strong>{data?.upcoming?.smsRecipients ?? data?.proWithSms ?? 0} SMS</strong>
                  {' '}(mismo aviso por email y SMS a PRO con SMS activo).
                </p>
              </div>
            </div>
            {(data?.upcoming?.items.length ?? 0) === 0 ? (
              <p className="text-sm text-[var(--ink-soft)]">
                No hay avisos PRO pendientes ni recordatorios programados ahora mismo.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--stroke)] text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                      <th className="px-2 py-2 font-semibold">Estado</th>
                      <th className="px-2 py-2 font-semibold">Cuándo</th>
                      <th className="px-2 py-2 font-semibold">Tipo</th>
                      <th className="px-2 py-2 font-semibold">Canales</th>
                      <th className="px-2 py-2 font-semibold">Promoción</th>
                      <th className="px-2 py-2 font-semibold">Destinatarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.upcoming?.items.map((item) => (
                      <tr key={item.id} className="border-b border-[var(--stroke)] align-top">
                        <td className="px-2 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                              item.state === 'ready'
                                ? 'bg-[rgba(22,112,85,0.12)] text-[var(--green-700)]'
                                : item.state === 'scheduled'
                                  ? 'bg-sky-100 text-sky-900'
                                  : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {stateLabel(item.state)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-xs">
                          {item.state === 'ready'
                            ? 'Hoy / al despachar'
                            : item.scheduledFor || '—'}
                          {item.estimatedPublicationDate ? (
                            <span className="mt-1 block text-[var(--ink-soft)]">
                              Est. pub.: {item.estimatedPublicationDate}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-2 py-2 text-xs font-semibold">{kindLabel(item.kind)}</td>
                        <td className="px-2 py-2 text-xs uppercase tracking-wide">
                          {item.channels.join(' + ')}
                        </td>
                        <td className="px-2 py-2">
                          <Link
                            href={`/admin/alerts`}
                            className="font-semibold text-[var(--ink)] hover:text-[var(--green-700)]"
                          >
                            {item.title}
                          </Link>
                          {item.location ? (
                            <span className="mt-1 block text-xs text-[var(--ink-soft)]">
                              {item.location}
                            </span>
                          ) : null}
                          <span className="mt-1 block text-xs text-[var(--ink-soft)]">{item.note}</span>
                        </td>
                        <td className="px-2 py-2 text-xs">
                          Email ~{item.emailRecipients}
                          {item.channels.includes('sms') ? (
                            <span className="mt-1 block font-semibold text-[var(--green-700)]">
                              SMS ~{item.smsRecipients}
                            </span>
                          ) : (
                            <span className="mt-1 block text-[var(--ink-soft)]">Sin SMS</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SurfaceCard>

          <SurfaceCard className="space-y-3 p-4 md:p-5">
            <h2 className="text-lg font-bold text-[var(--ink)]">Filtros</h2>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['all', 'Todos'],
                  ['email', 'Email'],
                  ['sms', 'SMS'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setChannel(value)}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                    channel === value
                      ? 'bg-[var(--green-700)] text-white'
                      : 'border border-[var(--stroke)] bg-white text-[var(--ink)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['all', 'Cualquier estado'],
                  ['sent', 'Enviados'],
                  ['failed', 'Fallidos'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                    status === value
                      ? 'bg-[var(--green-700)] text-white'
                      : 'border border-[var(--stroke)] bg-white text-[var(--ink)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                setQuery(searchInput.trim());
              }}
            >
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar email, teléfono u origen (purchase.pro, pro_alert…)"
                className="ds-control w-full"
              />
              <button type="submit" className="btn btn--secondary min-h-11 shrink-0">
                Buscar
              </button>
            </form>
            <p className="text-xs text-[var(--ink-soft)]">
              Mostrando {data?.logs.length ?? 0} de {data?.totalLogs ?? 0} registros.
            </p>
          </SurfaceCard>

          <SurfaceCard className="space-y-3 p-4 md:p-5">
            <h2 className="text-lg font-bold text-[var(--ink)]">Historial de envíos</h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Cada fila es un intento real a Brevo (éxito o error), con destinatario y tipo de mensaje.
            </p>
            <DeliveryTable
              logs={data?.logs ?? []}
              empty="No hay envíos con estos filtros. Cuando se mande un email o SMS aparecerá aquí."
            />
          </SurfaceCard>

          <SurfaceCard className="space-y-3 p-4 md:p-5">
            <h2 className="text-lg font-bold text-[var(--ink)]">Acciones SMS PRO</h2>
            <p className="text-sm leading-6 text-[var(--ink-soft)]">
              Activa SMS a PRO existentes, envía el SMS de configuración o dispara avisos de promociones.
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
            <DeliveryTable
              logs={data?.confirmationLogs ?? []}
              empty="Todavía no hay SMS de confirmación. Usa «Enviar SMS de configuración a mí» para probar."
            />
          </SurfaceCard>

          <SurfaceCard className="space-y-3 p-4 md:p-5">
            <h2 className="text-lg font-bold text-[var(--ink)]">Errores recientes</h2>
            {(data?.recentFailures.length ?? 0) === 0 ? (
              <p className="text-sm text-[var(--ink-soft)]">Sin errores recientes de SMS/email.</p>
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
        </div>
      </div>
    </main>
  );
}
