'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { UserProfile } from '@/types';

type Props = {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
};

export function EmailVerificationBanner({ profile, onProfileUpdate }: Props) {
  const [emailDraft, setEmailDraft] = useState(profile.email);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (profile.emailVerifiedAt) return null;

  async function resend() {
    setBusy(true);
    setMessage('');
    try {
      const out = await api.resendVerificationEmail();
      setMessage(out.message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo reenviar.');
    } finally {
      setBusy(false);
    }
  }

  async function correctEmail() {
    setBusy(true);
    setMessage('');
    try {
      const out = await api.updateUnverifiedEmail(emailDraft.trim());
      setMessage(out.message);
      onProfileUpdate({ ...profile, email: out.email });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo actualizar el email.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
      <h2 className="font-black">Verifica tu email para activar accesos</h2>
      <p className="mt-2 leading-6">
        Hasta verificar mantienes permisos de visitante. Las compras quedan guardadas y se activan al
        confirmar el correo. Te enviamos el enlace a <strong>{profile.email}</strong>.
      </p>
      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide">
        Corregir email
        <input
          type="email"
          className="ds-control mt-1 w-full"
          value={emailDraft}
          onChange={(e) => setEmailDraft(e.target.value)}
        />
      </label>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="btn btn--primary"
          disabled={busy || !emailDraft.trim()}
          onClick={() => void correctEmail()}
        >
          Guardar email y reenviar
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          disabled={busy}
          onClick={() => void resend()}
        >
          Reenviar verificación
        </button>
        <Link href="/verify-email" className="btn btn--secondary">
          Ir a verificación
        </Link>
      </div>
      {message ? (
        <p className="mt-2 text-xs font-semibold" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
