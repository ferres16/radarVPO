'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { proExclusiveFeatures } from '@/lib/pro';
import { ProCta } from '@/components/pro/pro-cta';
import { FormField } from '@/components/design-system';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.login(email, password);
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.assign(next && next.startsWith('/') ? next : '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lp lp--inner lp--app auth-shell">
      <section className="shell py-4 md:py-10">
        <section className="public-card mx-auto grid max-w-5xl overflow-hidden md:grid-cols-[1.1fr_0.9fr]">
          <div className="order-1 p-5 md:order-2 md:p-8">
            <h1 className="text-2xl font-bold text-[var(--ink)]">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">Accede a tu perfil, promociones y cursos.</p>

            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <FormField id="email" label="Email">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="ds-control w-full"
                />
              </FormField>
              <FormField id="password" label="Contraseña">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="ds-control w-full"
                />
              </FormField>
              {error ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="alert" aria-live="polite">
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={loading} className="btn btn--primary btn--lg btn--block">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-[var(--ink-soft)]">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="font-semibold text-[var(--green-700)]">
                Crear cuenta gratis
              </Link>
            </p>
          </div>

          <aside className="order-2 border-t border-[var(--stroke)] bg-[var(--ink)] p-5 text-white md:order-1 md:border-t-0 md:border-r md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Radar VPO</p>
            <h2 className="mt-3 text-xl font-bold leading-tight md:text-2xl">Tu ventaja para conseguir VPO</h2>
            <p className="mt-3 text-sm leading-6 text-white/78">
              Gratis consultas promociones y lanzamientos. PRO añade avisos por email y SMS, y el curso Guía VPO.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-white/85">
              {proExclusiveFeatures.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
            <div className="mt-6">
              <ProCta variant="secondary" block className="!border-white/20 !bg-white !text-[var(--ink)]" />
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
