'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { proHref, proPlan } from '@/lib/pro';
import { ButtonLink } from '@/components/design-system';

export default function RegisterPage() {
  const router = useRouter();
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
      router.push(isProIntent ? proHref : '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell pb-16">
      <section className="premium-card mx-auto grid max-w-5xl overflow-hidden md:grid-cols-[1.05fr_0.95fr] animate-fade-up">
        <div className="p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-700)]">
            {isProIntent ? proPlan.name : 'Cuenta gratuita'}
          </p>
          <h1 className="display-type mt-3 text-2xl font-black text-[var(--ink)] md:text-3xl">
            {isProIntent ? 'Activa tu ventaja competitiva' : 'Crea tu cuenta'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            {isProIntent
              ? `${proPlan.price}. Notificaciones prioritarias, seguimiento de municipios y curso incluido.`
              : 'Guarda oportunidades y accede a próximos lanzamientos y promociones publicadas.'}
          </p>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-[var(--ink)]">Nombre completo</label>
              <input id="fullName" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="ds-control mt-1 w-full" />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-[var(--ink)]">Email</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="ds-control mt-1 w-full" />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-[var(--ink)]">Teléfono</label>
              <input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="ds-control mt-1 w-full" />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-[var(--ink)]">Contraseña</label>
              <input id="password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required aria-describedby="password-help" className="ds-control mt-1 w-full" />
              <div className="mt-2" id="password-help">
                <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-muted)]" aria-hidden="true">
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--green-700)] to-[var(--cyan-500)] transition-all" style={{ width: `${Math.max(passwordScore, 1) * 25}%` }} />
                </div>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">Fortaleza: {passwordLabel}</p>
              </div>
            </div>
            {error ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="alert" aria-live="polite">{error}</p> : null}
            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[var(--green-700)] px-4 py-3 font-bold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-[var(--green-900)] disabled:opacity-60">
              {loading ? 'Creando...' : isProIntent ? proPlan.ctaLabel : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-4 text-sm text-[var(--ink-soft)]">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-semibold text-[var(--green-700)]">Entrar</Link>
          </p>
        </div>

        <aside className="section-band--muted border-0 bg-transparent p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-700)]">Qué obtienes</p>
          <h2 className="display-type mt-4 text-2xl font-black text-[var(--ink)] md:text-3xl">
            {isProIntent ? 'Llega preparado al plazo' : 'Empieza gratis, sube a PRO cuando quieras'}
          </h2>
          <div className="mt-6 space-y-3">
            {(isProIntent
              ? ['Notificaciones SMS prioritarias', 'Avisos por correo', proPlan.courseLabel, 'Seguimiento de municipios']
              : ['Próximos lanzamientos en web', 'Promociones publicadas', 'Perfil y favoritos', 'Upgrade a VPO PRO']
            ).map((item) => (
              <div key={item} className="rounded-2xl border border-[var(--stroke)] bg-white/90 p-4 text-sm font-semibold text-[var(--ink)] shadow-sm">
                {item}
              </div>
            ))}
          </div>
          {isProIntent ? null : (
            <div className="mt-6">
              <ButtonLink href="/register?intent=pro">{proPlan.ctaLabel}</ButtonLink>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
