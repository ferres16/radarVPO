'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { ProfileCard } from '@/components/profile-card';
import { StatusPill } from '@/components/status-pill';
import {
  formatProfileDate,
  getProStatusLabel,
  getProStatusTone,
} from '@/lib/pro-access';
import { getProActiveMessage, proIncludes, proPlan } from '@/lib/pro';
import type { UserProfile } from '@/types';
import { ProCta } from '@/components/pro/pro-cta';

type ProStatusCardProps = {
  profile: UserProfile;
  onProfileUpdate?: (profile: UserProfile) => void;
};

export function ProStatusCard({ profile, onProfileUpdate }: ProStatusCardProps) {
  const proAccess = profile.proAccess;
  const hasPro = proAccess?.hasAccess ?? profile.plan === 'pro';
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  async function handleManageSubscription() {
    setPortalLoading(true);
    setActionError('');
    setActionMessage('');
    try {
      const { url } = await api.createBillingPortalSession();
      window.location.href = url;
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'No se pudo abrir la gestión de suscripción.',
      );
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleRequestCancellation() {
    setCancelLoading(true);
    setActionError('');
    setActionMessage('');
    try {
      await api.requestProCancellation();
      const updated = await api.getMe();
      onProfileUpdate?.(updated);
      setActionMessage('Solicitud de cancelación registrada. Te contactaremos pronto.');
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar la solicitud de cancelación.',
      );
    } finally {
      setCancelLoading(false);
    }
  }

  if (!hasPro) {
    return (
      <ProfileCard className="relative overflow-hidden bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_60%)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[rgba(54,189,248,0.12)] blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--cyan-700)]">
            {proPlan.name}
          </p>
          <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)] md:text-3xl">
            Avisos y curso Guía VPO
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
            Recibe avisos por email y SMS cuando detectamos lanzamientos relevantes, y accede al curso Guía VPO.
          </p>
          <p className="mt-4 text-3xl font-black text-[var(--ink)]">{proPlan.price}</p>
          <ul className="mt-4 space-y-2">
            {proIncludes.map((item) => (
              <li key={item.title} className="flex items-start gap-2 text-sm text-[var(--ink)]">
                <span aria-hidden="true">{item.icon}</span>
                <span>
                  <strong>{item.title}</strong>
                  <span className="block text-[var(--ink-soft)]">{item.description}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <ProCta size="lg" block />
          </div>
        </div>
      </ProfileCard>
    );
  }

  const status = proAccess?.status ?? 'active';
  const activeMessage = getProActiveMessage(profile.id);

  return (
    <ProfileCard className="relative overflow-hidden bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_65%)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[rgba(47,107,36,0.1)] blur-3xl" />
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">
            {proPlan.name}
          </p>
          <StatusPill
            label={getProStatusLabel(status)}
            tone={getProStatusTone(status)}
          />
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
                Próxima renovación
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                {formatProfileDate(proAccess.nextRenewalAt)}
              </p>
            </div>
          ) : null}
        </div>
        {status === 'cancel_pending' ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Tu cancelación está en proceso. Seguirás teniendo acceso hasta que finalice el periodo actual.
          </p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          {proAccess?.canManageViaStripe ? (
            <button
              type="button"
              onClick={() => void handleManageSubscription()}
              disabled={portalLoading}
              className="btn btn--primary"
            >
              {portalLoading ? 'Abriendo portal...' : 'Gestionar suscripción'}
            </button>
          ) : proAccess?.managementMethod === 'manual_request' ? (
            <>
              {!proAccess.cancellationRequestedAt ? (
                <button
                  type="button"
                  onClick={() => void handleRequestCancellation()}
                  disabled={cancelLoading}
                  className="btn btn--secondary"
                >
                  {cancelLoading ? 'Enviando...' : 'Solicitar cancelación'}
                </button>
              ) : (
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Cancelación solicitada. Un administrador la procesará pronto.
                </p>
              )}
            </>
          ) : null}
        </div>
        {actionMessage ? (
          <p className="text-sm font-semibold text-[var(--green-700)]">{actionMessage}</p>
        ) : null}
        {actionError ? (
          <p className="text-sm font-semibold text-red-700">{actionError}</p>
        ) : null}
      </div>
    </ProfileCard>
  );
}
