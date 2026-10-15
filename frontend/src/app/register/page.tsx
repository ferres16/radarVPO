'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { freePlanFeatures } from '@/lib/pro';
import { safeNextPath } from '@/lib/safe-next';
import { FormField } from '@/components/design-system';

export default function RegisterPage() {
  const [nextPath, setNextPath] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const passwordLabel = ['Muy débil', 'Básica', 'Media', 'Buena', 'Fuerte'][passwordScore];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Compatibilidad con enlaces antiguos (?intent=pro): llevan al checkout de PRO.
    const legacyIntent = params.get('intent') === 'pro' ? '/checkout?product=pro' : '';
    setNextPath(safeNextPath(params.get('next'), legacyIntent));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.register(email, password, fullName, phone);
      window.location.assign(safeNextPath(nextPath));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login';
  const buying = nextPath.startsWith('/checkout');

  return (
    <main className="lp lp--inner lp--app auth-shell">
      <section className="shell py-4 md:py-10">
        <section className="public-card mx-auto grid max-w-5xl overflow-hidden md:grid-cols-[1.05fr_0.95fr]">
          <div className="p-5 md:p-8">
            <span className="lp-hero__badge">Cuenta gratuita</span>
            <h1 className="mt-3 text-2xl font-bold text-[var(--ink)] md:text-3xl">
              Crea tu cuenta en 1 minuto
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              {buying
                ? 'Necesitamos una cuenta para activar tu compra. Al terminar volverás al resumen del pedido.'
                : 'La cuenta es gratis. Con ella guardas promociones y accedes a la lección de muestra del curso.'}
            </p>

            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <FormField id="fullName" label="Nombre completo">
                <input id="fullName" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="ds-control w-full" />
              </FormField>
              <FormField id="email" label="Email">
                <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="ds-control w-full" />
              </FormField>
              <FormField id="phone" label="Móvil (opcional)" hint="Solo se usa para los avisos por SMS de Radar VPO PRO. Puedes añadirlo después.">
                <input id="phone" type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="ds-control w-full" />
              </FormField>
              <FormField id="password" label="Contraseña">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-describedby="password-help"
                  className="ds-control w-full"
                />
              </FormField>
              <div id="password-help">
                <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-muted)]" aria-hidden="true">
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--green-700)] to-[var(--cyan-500)] transition-all" style={{ width: `${Math.max(passwordScore, 1) * 25}%` }} />
                </div>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">Fortaleza: {passwordLabel}</p>
              </div>
              {error ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="alert" aria-live="polite">
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={loading} className="btn btn--primary btn--lg btn--block">
                {loading ? 'Creando...' : buying ? 'Crear cuenta y continuar' : 'Crear cuenta gratis'}
              </button>
              <p className="text-center text-xs text-[var(--ink-soft)]">
                Al crear la cuenta aceptas las{' '}
                <Link href="/condiciones" className="font-semibold text-[var(--green-700)]">
                  condiciones del servicio
                </Link>
                . La información es orientativa y no sustituye a las fuentes oficiales.
              </p>
            </form>

            <p className="mt-4 text-center text-sm text-[var(--ink-soft)]">
              ¿Ya tienes cuenta?{' '}
              <Link href={loginHref} className="font-semibold text-[var(--green-700)]">Entrar</Link>
            </p>
          </div>

          <aside className="border-t border-[var(--stroke)] bg-[#f8faf9] p-5 md:border-l md:border-t-0 md:p-8">
            <p className="lp-eyebrow">Qué incluye la cuenta gratuita</p>
            <div className="mt-4 space-y-2">
              {freePlanFeatures.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--ink)]">
                  <span className="text-[var(--green-700)]" aria-hidden="true">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
