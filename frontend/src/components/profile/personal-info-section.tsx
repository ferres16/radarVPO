'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { ProfileCard } from '@/components/profile-card';
import { formatProfileDate, splitFullName } from '@/lib/pro-access';
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

  const { firstName, lastName } = splitFullName(profile.fullName);

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
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setError('El nombre es obligatorio.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await api.updateMe({
        fullName: trimmedName,
        phone: phone.trim(),
      });
      onProfileUpdate(updated);
      setEditing(false);
      setSuccess('Perfil actualizado correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProfileCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">
            Información personal
          </p>
          <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">
            Tus datos
          </h2>
        </div>
        {!editing ? (
          <button type="button" onClick={startEditing} className="btn btn--secondary">
            Editar perfil
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Nombre completo
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
              Teléfono
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="ds-control mt-1 w-full"
              maxLength={30}
              placeholder="Opcional"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Email
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
              disabled={saving}
              className="btn btn--primary"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
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
          <InfoItem label="Nombre" value={firstName || '—'} />
          {lastName ? <InfoItem label="Apellidos" value={lastName} /> : null}
          <InfoItem label="Email" value={profile.email} />
          <InfoItem label="Teléfono" value={profile.phone?.trim() || '—'} />
          <InfoItem
            label="Fecha de registro"
            value={formatProfileDate(profile.createdAt)}
          />
        </dl>
      )}

      {success ? (
        <p className="mt-4 text-sm font-semibold text-[var(--green-700)]">{success}</p>
      ) : null}
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
