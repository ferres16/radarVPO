'use client';

import { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { CATALUNYA_MUNICIPALITIES } from '@/lib/municipalities';
import { hasProAccess } from '@/lib/pro-access';
import { ProfileCard } from '@/components/profile-card';
import type { UserProfile } from '@/types';

const TYPE_OPTIONS: Array<{ id: 'venta' | 'alquiler' | 'mixto'; label: string }> = [
  { id: 'alquiler', label: 'Alquiler' },
  { id: 'venta', label: 'Compra / venta' },
  { id: 'mixto', label: 'Mixto' },
];

const POPULAR = CATALUNYA_MUNICIPALITIES.slice(0, 24);

export function ProAlertPreferences({
  profile,
  onProfileUpdate,
}: {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}) {
  const isPro = hasProAccess(profile);
  const [municipalities, setMunicipalities] = useState<string[]>(
    profile.alertMunicipalityIds || [],
  );
  const [types, setTypes] = useState<Array<'venta' | 'alquiler' | 'mixto'>>(
    profile.alertPromotionTypes || [],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dirty = useMemo(() => {
    const currentM = [...(profile.alertMunicipalityIds || [])].sort().join('|');
    const nextM = [...municipalities].sort().join('|');
    const currentT = [...(profile.alertPromotionTypes || [])].sort().join('|');
    const nextT = [...types].sort().join('|');
    return currentM !== nextM || currentT !== nextT;
  }, [municipalities, types, profile.alertMunicipalityIds, profile.alertPromotionTypes]);

  if (!isPro) return null;

  function toggleMunicipality(id: string) {
    setMunicipalities((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleType(id: 'venta' | 'alquiler' | 'mixto') {
    setTypes((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function save() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await api.updateMe({
        alertMunicipalityIds: municipalities,
        alertPromotionTypes: types,
      });
      onProfileUpdate(updated);
      setSuccess('Preferencias de avisos guardadas. Tus promociones guardadas no se modifican.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar las preferencias.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProfileCard>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">
        Avisos PRO
      </p>
      <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">
        Municipios y compra/alquiler
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
        Si eliges municipios, solo recibirás avisos de esos. Vacío = todos los que detectamos. Cambiar
        esto no borra tus guardados en Mi espacio.
      </p>

      <div className="mt-4">
        <p className="text-sm font-bold text-[var(--ink)]">Municipios</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {POPULAR.map((item) => {
            const active = municipalities.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleMunicipality(item.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  active
                    ? 'border-[var(--green-700)] bg-[var(--bg-eco)] text-[var(--green-700)]'
                    : 'border-[var(--stroke)] bg-white text-[var(--ink)]'
                }`}
                aria-pressed={active}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-bold text-[var(--ink)]">Régimen</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((item) => {
            const active = types.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleType(item.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  active
                    ? 'border-[var(--green-700)] bg-[var(--bg-eco)] text-[var(--green-700)]'
                    : 'border-[var(--stroke)] bg-white text-[var(--ink)]'
                }`}
                aria-pressed={active}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-[var(--bg-eco)] px-3 py-2 text-xs leading-5 text-[var(--ink)]">
        Ejemplo de aviso: «Nueva promoción en Montgat (alquiler). Abre la ficha y el PDF oficial.» Distinguimos
        anuncio previo, promoción publicada y plazo confirmado en el mensaje.
      </p>

      {error ? (
        <p className="mt-3 text-sm font-semibold text-amber-900" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-3 text-sm font-semibold text-[var(--green-700)]" role="status">
          {success}
        </p>
      ) : null}

      <button
        type="button"
        className="btn btn--primary mt-4"
        disabled={!dirty || saving}
        onClick={() => void save()}
      >
        {saving ? 'Guardando…' : 'Guardar preferencias'}
      </button>
    </ProfileCard>
  );
}
