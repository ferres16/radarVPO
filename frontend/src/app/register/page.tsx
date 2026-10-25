'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { freePlanFeatures } from '@/lib/pro';
import { safeNextPath } from '@/lib/safe-next';
import { FormField } from '@/components/design-system';

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="lp lp--inner lp--app auth-shell">
          <section className="shell py-4 md:py-10">
            <p className="text-sm text-[var(--ink-soft)]">Cargando…</p>
          </section>
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => {
      const legacyIntent = searchParams.get('intent') === 'pro' ? '/pro#pagar' : '';
    return safeNextPath(searchParams.get('next'), legacyIntent);
  }, [searchParams]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.register(
        email,
        password,
        fullName,
        undefined,
        acceptedPrivacy,
        acceptedMarketing,
      );
      window.location.assign(safeNextPath(nextPath));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login';
  const buying =
    nextPath.startsWith('/checkout') ||
    nextPath.startsWith('/pro') ||
    nextPath.startsWith('/cursos/');

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
                ? 'Necesitamos una cuenta para activar tu compra. Al terminar vuelves a pagar en la ficha.'
                : 'La cuenta es gratis. Con ella guardas promociones y accedes a la muestra de las guías que la ofrezcan.'}
            </p>

            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <p className="rounded-xl bg-[var(--bg-eco)] px-3 py-2 text-xs leading-5 text-[var(--ink)]">
                Usamos tu nombre y correo para crear la cuenta y darte acceso. El móvil solo se pide si activas los
                SMS de PRO. Más detalle en la{' '}
                <Link href="/privacidad" className="font-semibold underline">
                  política de privacidad
                </Link>
                .
              </p>
              <FormField id="fullName" label="Nombre" hint="Para dirigirnos a ti en los emails. Basta con un nombre.">
                <input id="fullName" autoComplete="given-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} className="ds-control w-full" />
              </FormField>
              <FormField id="email" label="Email">
                <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="ds-control w-full" />
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
              <label className="flex items-start gap-3 text-sm leading-6 text-[var(--ink)]">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(event) => setAcceptedPrivacy(event.target.checked)}
                  required
                  className="mt-1 h-4 w-4 shrink-0"
                />
                <span>
                  He leído y acepto la{' '}
                  <Link href="/privacidad" className="font-semibold text-[var(--green-700)] underline">
                    política de privacidad
                  </Link>{' '}
                  y las{' '}
                  <Link href="/condiciones" className="font-semibold text-[var(--green-700)] underline">
                    condiciones del servicio
                  </Link>
                  .
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm leading-6 text-[var(--ink)]">
                <input
                  type="checkbox"
                  checked={acceptedMarketing}
                  onChange={(event) => setAcceptedMarketing(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0"
                />
                <span>
                  Quiero recibir novedades y contenidos educativos de Radar VPO por email
                  (opcional). Puedes darte de baja cuando quieras. No es necesario para usar la
                  cuenta ni para PRO.
                </span>
              </label>
              {error ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="alert" aria-live="polite">
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={loading || !acceptedPrivacy} className="btn btn--primary btn--lg btn--block">
                {loading ? 'Creando...' : buying ? 'Crear cuenta y continuar' : 'Crear cuenta gratis'}
              </button>
              <p className="text-center text-xs text-[var(--ink-soft)]">
                La información es orientativa y no sustituye a las fuentes oficiales.
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
