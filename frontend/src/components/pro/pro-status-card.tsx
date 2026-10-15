'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { ProfileCard } from '@/components/profile-card';
import { StatusPill } from '@/components/status-pill';
import { ButtonLink } from '@/components/design-system';
import {
  formatProfileDate,
  getProStatusLabel,
  getProStatusTone,
} from '@/lib/pro-access';
import { getProActiveMessage, proIncludes, proPlan } from '@/lib/pro';
import type { UserProfile } from '@/types';

type ProStatusCardProps = {
  profile: UserProfile;
  onProfileUpdate?: (profile: UserProfile) => void;
};

export function ProStatusCard({ profile, onProfileUpdate }: ProStatusCardProps) {
  const proAccess = profile.proAccess;
  const hasPro = proAccess?.hasAccess ?? profile.plan === 'pro';
  const [portalLoading, setPortalLoading] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  async function handleManageBilling() {
    setPortalLoading(true);
    setActionError('');
    setActionMessage('');
    try {
      const { url } = await api.createBillingPortalSession();
      window.location.href = url;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'No se pudo abrir la gestión de facturación.',
      );
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleWithdrawCancellation() {
    setWithdrawLoading(true);
    setActionError('');
    setActionMessage('');
    try {
      await api.withdrawProCancellation();
      trackEvent('subscription_cancel_withdrawn');
      const updated = await api.getMe();
      onProfileUpdate?.(updated);
      setActionMessage('Hecho: tu suscripción sigue activa y se renovará con normalidad.');
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'No se pudo mantener la suscripción.',
      );
    } finally {
      setWithdrawLoading(false);
    }
  }

  async function handleConfirmCancellation() {
    setCancelLoading(true);
    setActionError('');
    setActionMessage('');
    try {
      const result = await api.requestProCancellation();
      trackEvent('subscription_cancel_requested', { mode: result.mode });
      const updated = await api.getMe();
      onProfileUpdate?.(updated);
      setConfirmingCancel(false);
      if (result.mode === 'stripe') {
        setActionMessage(
          result.accessUntil
            ? `Suscripción cancelada. No se volverá a cobrar y mantienes el acceso hasta el ${formatProfileDate(result.accessUntil)}.`
            : 'Suscripción cancelada. No se volverá a cobrar.',
        );
      } else {
        setActionMessage(
          'Hemos registrado tu solicitud de cancelación. El equipo la procesará y mantendrás el acceso hasta el final del periodo ya pagado.',
        );
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'No se pudo registrar la cancelación.',
      );
    } finally {
      setCancelLoading(false);
    }
  }

  if (!hasPro) {
    return (
      <ProfileCard className="relative overflow-hidden bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_60%)]">
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--cyan-700)]">
            {proPlan.name}
          </p>
          <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)] md:text-3xl">
            Avisos y organización sin límite
          </h2>
          <p className="mt-4 text-3xl font-black text-[var(--ink)]">{proPlan.price}</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Cancelas cuando quieras desde esta misma página.</p>
          <ul className="mt-4 space-y-2">
            {proIncludes.map((item) => (
              <li key={item.title} className="flex items-start gap-2 text-sm text-[var(--ink)]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green-700)]" aria-hidden="true" />
                <span>
                  <strong>{item.title}</strong>
                  <span className="block text-[var(--ink-soft)]">{item.description}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <ButtonLink href={proPlan.landingHref} size="lg" block>
              Ver Radar VPO PRO
            </ButtonLink>
          </div>
        </div>
      </ProfileCard>
    );
  }

  const status = proAccess?.status ?? 'active';
  const activeMessage = getProActiveMessage(profile.id);
  const cancelPending = status === 'cancel_pending';
  const isStripeManaged = proAccess?.managementMethod === 'stripe_portal';

  return (
    <ProfileCard className="relative overflow-hidden bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_65%)]">
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">
            {proPlan.name}
          </p>
          <StatusPill label={getProStatusLabel(status)} tone={getProStatusTone(status)} />
        </div>
        <h2 className="display-type text-2xl font-black text-[var(--ink)] md:text-3xl">
          {activeMessage}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {proAccess?.activatedAt ? (
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Activación
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                {formatProfileDate(proAccess.activatedAt)}
              </p>
            </div>
          ) : null}
          {proAccess?.nextRenewalAt ? (
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                {cancelPending ? 'Acceso hasta' : 'Próxima renovación'}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                {formatProfileDate(proAccess.nextRenewalAt)}
              </p>
            </div>
          ) : null}
        </div>

        {cancelPending ? (
          <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">
              {isStripeManaged
                ? 'Has cancelado la suscripción: no se volverá a cobrar y mantienes el acceso hasta el final del periodo pagado.'
                : 'Tu solicitud de cancelación está registrada. Mantienes el acceso hasta el final del periodo pagado.'}
            </p>
            <button
              type="button"
              onClick={() => void handleWithdrawCancellation()}
              disabled={withdrawLoading}
              className="btn btn--secondary min-h-11 w-full sm:w-auto"
            >
              {withdrawLoading ? 'Un momento…' : 'Mantener mi suscripción'}
            </button>
          </div>
        ) : confirmingCancel ? (
          <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900">
              ¿Cancelar Radar VPO PRO? Mantendrás el acceso hasta el final del periodo ya pagado y no se volverá a
              cobrar.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void handleConfirmCancellation()}
                disabled={cancelLoading}
                className="btn btn--primary min-h-11"
              >
                {cancelLoading ? 'Cancelando…' : 'Sí, cancelar suscripción'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingCancel(false)}
                disabled={cancelLoading}
                className="btn btn--secondary min-h-11"
              >
                No, mantenerla
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          {isStripeManaged ? (
            <button
              type="button"
              onClick={() => void handleManageBilling()}
              disabled={portalLoading}
              className="btn btn--secondary"
            >
              {portalLoading ? 'Abriendo…' : 'Facturas y método de pago'}
            </button>
          ) : null}
          {!cancelPending && !confirmingCancel ? (
            <button
              type="button"
              onClick={() => {
                setActionMessage('');
                setActionError('');
                setConfirmingCancel(true);
              }}
              className="btn btn--secondary"
            >
              Cancelar suscripción
            </button>
          ) : null}
        </div>

        {actionMessage ? (
          <p className="text-sm font-semibold text-[var(--green-700)]" role="status">
            {actionMessage}
          </p>
        ) : null}
        {actionError ? (
          <p className="text-sm font-semibold text-red-700" role="alert">
            {actionError}
          </p>
        ) : null}
      </div>
    </ProfileCard>
  );
}
