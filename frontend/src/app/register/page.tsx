'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { proHref, proPlan } from '@/lib/pro';
import { ButtonLink, FormField } from '@/components/design-system';

export default function RegisterPage() {
  const [intent, setIntent] = useState('');
  const isProIntent = intent === 'pro';
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
    setIntent(new URLSearchParams(window.location.search).get('intent') || '');
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.register(email, password, fullName, phone);
      window.location.assign(isProIntent ? proHref : '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lp lp--inner lp--app auth-shell">
      <section className="shell py-4 md:py-10">
        <section className="public-card mx-auto grid max-w-5xl overflow-hidden md:grid-cols-[1.05fr_0.95fr]">
          <div className="p-5 md:p-8">
            <span className="lp-hero__badge">{isProIntent ? proPlan.name : 'Cuenta gratuita'}</span>
            <h1 className="mt-3 text-2xl font-bold text-[var(--ink)] md:text-3xl">
              {isProIntent ? 'Activa tu ventaja PRO' : 'Crea tu cuenta en 1 minuto'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              {isProIntent
                ? `${proPlan.price}. Alertas prioritarias y curso incluido.`
                : 'Gratis para empezar. Sube a PRO cuando quieras ventaja real.'}
            </p>

            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <FormField id="fullName" label="Nombre completo">
                <input id="fullName" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="ds-control w-full" />
              </FormField>
              <FormField id="email" label="Email">
                <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="ds-control w-full" />
              </FormField>
              <FormField id="phone" label="Móvil" hint="Para alertas SMS con VPO PRO. Ej: 612345678">
                <input id="phone" type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="ds-control w-full" />
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
                {loading ? 'Creando...' : isProIntent ? proPlan.ctaLabel : 'Crear cuenta gratis'}
              </button>
              <p className="text-center text-xs text-[var(--ink-soft)]">
                Información orientativa. No sustituye fuentes oficiales.
              </p>
            </form>

            <p className="mt-4 text-center text-sm text-[var(--ink-soft)]">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-semibold text-[var(--green-700)]">Entrar</Link>
            </p>
          </div>

          <aside className="border-t border-[var(--stroke)] bg-[#f8faf9] p-5 md:border-l md:border-t-0 md:p-8">
            <p className="lp-eyebrow">Qué obtienes</p>
            <h2 className="mt-2 text-xl font-bold text-[var(--ink)]">
              {isProIntent ? 'Llega preparado al plazo' : 'Empieza gratis hoy'}
            </h2>
            <div className="mt-4 space-y-2">
              {(isProIntent
                ? ['SMS + email al instante', 'Monitorización continua', proPlan.courseLabel, 'Sin permanencia']
                : ['Lanzamientos en web', 'Promociones publicadas', 'Perfil y favoritos', 'Upgrade a PRO']
              ).map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--ink)]">
                  <span className="text-[var(--green-700)]" aria-hidden="true">✓</span>
                  {item}
                </div>
              ))}
            </div>
            {isProIntent ? null : (
              <div className="mt-5">
                <ButtonLink href="/register?intent=pro" block>
                  {proPlan.ctaLabel}
                </ButtonLink>
              </div>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}
