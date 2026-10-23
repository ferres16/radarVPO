'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FormField } from '@/components/design-system';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || submitted) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await api.requestPasswordReset(email.trim());
      setMessage(result.message);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo enviar el correo de recuperación.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lp lp--inner lp--app auth-shell">
      <section className="shell py-4 md:py-10">
        <section className="public-card mx-auto max-w-xl p-5 md:p-8">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Recuperar contraseña</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Te enviaremos un enlace para restablecer la contraseña. Solo puedes solicitarlo una vez cada 24 horas.
          </p>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <FormField id="email" label="Email">
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitted}
                className="ds-control w-full"
              />
            </FormField>

            {error ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="alert">
                {error}
              </p>
            ) : null}

            {message ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900" role="status">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading || submitted}
              className="btn btn--primary btn--lg btn--block"
            >
              {loading ? 'Enviando...' : submitted ? 'Correo enviado' : 'Enviar enlace'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-[var(--ink-soft)]">
            <Link href="/login" className="font-semibold text-[var(--green-700)]">
              Volver a iniciar sesión
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}
