'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FormField } from '@/components/design-system';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const nextToken = new URLSearchParams(window.location.search).get('token') || '';
    setToken(nextToken);
    if (!nextToken) {
      setError('El enlace de recuperación no es válido.');
    }
  }, []);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const canSubmit =
    Boolean(token) &&
    password.length >= 8 &&
    password === confirmPassword &&
    !loading &&
    !completed;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await api.resetPassword(token, password);
      setMessage(result.message);
      setCompleted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo restablecer la contraseña.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lp lp--inner lp--app auth-shell">
      <section className="shell py-4 md:py-10">
        <section className="public-card mx-auto max-w-xl p-5 md:p-8">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Nueva contraseña</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Elige una contraseña segura para tu cuenta de Radar VPO.
          </p>

          {completed ? (
            <div className="mt-5 space-y-4">
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
                {message}
              </p>
              <Link href="/login" className="btn btn--primary btn--lg btn--block">
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <FormField id="password" label="Nueva contraseña">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={!token || loading}
                  className="ds-control w-full"
                />
              </FormField>
              <FormField id="confirmPassword" label="Confirmar contraseña">
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={!token || loading}
                  className="ds-control w-full"
                />
              </FormField>
              {password ? (
                <p className="text-xs text-[var(--ink-soft)]">
                  Fortaleza: {['Muy débil', 'Básica', 'Media', 'Buena', 'Fuerte'][passwordScore]}
                </p>
              ) : null}
              {confirmPassword && password !== confirmPassword ? (
                <p className="text-sm font-semibold text-red-700">
                  Las contraseñas no coinciden.
                </p>
              ) : null}
              {error ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={!canSubmit}
                className="btn btn--primary btn--lg btn--block"
              >
                {loading ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
            </form>
          )}

          {!completed ? (
            <p className="mt-4 text-center text-sm text-[var(--ink-soft)]">
              <Link href="/forgot-password" className="font-semibold text-[var(--green-700)]">
                Solicitar un nuevo enlace
              </Link>
            </p>
          ) : null}
        </section>
      </section>
    </main>
  );
}
