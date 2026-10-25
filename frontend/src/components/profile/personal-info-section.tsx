'use client';

import { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { ProfileCard } from '@/components/profile-card';
import { hasProAccess } from '@/lib/pro-access';
import type { UserProfile } from '@/types';

type PersonalInfoSectionProps = {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
};

export function PersonalInfoSection({
  profile,
  onProfileUpdate,
}: PersonalInfoSectionProps) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isPro = hasProAccess(profile);
  const marketingEnabled = Boolean(profile.marketingOptInAt);

  const hasChanges = useMemo(() => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    return (
      trimmedName !== (profile.fullName || '').trim() ||
      trimmedPhone !== (profile.phone || '').trim()
    );
  }, [fullName, phone, profile.fullName, profile.phone]);

  function startEditing() {
    setFullName(profile.fullName || '');
    setPhone(profile.phone || '');
    setError('');
    setSuccess('');
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setError('');
    setSuccess('');
  }

  async function saveProfile() {
    if (!hasChanges) return;

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await api.updateMe({
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      onProfileUpdate(updated);
      setEditing(false);
      setSuccess('Datos guardados.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function saveSmsPreference(enabled: boolean) {
    setError('');
    setSuccess('');
    try {
      const updated = await api.updateMe({ smsAlertsEnabled: enabled });
      onProfileUpdate(updated);
      setSuccess(enabled ? 'Avisos por SMS activados.' : 'Avisos por SMS desactivados.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la preferencia.');
    }
  }

  async function saveMarketingPreference(enabled: boolean) {
    setError('');
    setSuccess('');
    try {
      const updated = await api.updateMe({ marketingOptIn: enabled });
      onProfileUpdate(updated);
      setSuccess(
        enabled
          ? 'Recibirás novedades por email cuando las enviemos.'
          : 'Ya no recibirás novedades por email.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la preferencia.');
    }
  }

  return (
    <ProfileCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">
            Cuenta
          </p>
          <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">Tus datos</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
            El email identifica tu cuenta. El nombre es opcional.
            {isPro ? ' El teléfono solo se usa para avisos PRO si los activas.' : ''}
          </p>
        </div>
        {!editing ? (
          <button type="button" onClick={startEditing} className="btn btn--secondary">
            Editar
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Nombre (opcional)
            </span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="ds-control mt-1 w-full"
              maxLength={140}
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              {isPro ? 'Teléfono para avisos PRO' : 'Teléfono (opcional)'}
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="ds-control mt-1 w-full"
              maxLength={30}
              placeholder={isPro ? 'Opcional. Solo SMS de nuevas promociones.' : 'Opcional'}
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Email de acceso
            </span>
            <input
              value={profile.email}
              readOnly
              className="ds-control mt-1 w-full bg-[var(--bg-app)] text-[var(--ink-soft)]"
            />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={saving || !hasChanges}
              className="btn btn--primary"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="btn btn--secondary"
            >
              Cancelar
            </button>
          </div>
          {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
        </div>
      ) : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoItem label="Email de acceso" value={profile.email} />
          <InfoItem label="Nombre" value={profile.fullName?.trim() || 'No indicado'} />
          <InfoItem label="Teléfono" value={profile.phone?.trim() || 'No indicado'} />
        </dl>
      )}

      {success ? (
        <p className="mt-4 text-sm font-semibold text-[var(--green-700)]">{success}</p>
      ) : null}

      {isPro ? (
        <div className="mt-6 space-y-3 border-t border-[var(--stroke)] pt-5">
          <h3 className="text-sm font-semibold text-[var(--ink)]">SMS de nuevas promociones</h3>
          <p className="text-sm leading-6 text-[var(--ink-soft)]">
            Solo con Radar VPO PRO. No hay SMS de marketing.
          </p>
          <label className="flex items-start gap-3 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={Boolean(profile.smsAlertsEnabled)}
              onChange={(e) => void saveSmsPreference(e.target.checked)}
            />
            <span>Recibir SMS cuando se detecten nuevas promociones</span>
          </label>
        </div>
      ) : null}

      <details className="mt-6 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--ink)]">
          Novedades por email
        </summary>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          Opcional. Contenidos educativos o novedades del producto. No son los avisos PRO ni SMS.
        </p>
        <label className="mt-3 flex items-start gap-3 text-sm text-[var(--ink)]">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={marketingEnabled}
            onChange={(e) => void saveMarketingPreference(e.target.checked)}
          />
          <span>Quiero recibir novedades por email</span>
        </label>
      </details>
    </ProfileCard>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-[var(--ink)]">{value}</dd>
    </div>
  );
}
