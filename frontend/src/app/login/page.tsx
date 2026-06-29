'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { proHref, proPlan } from '@/lib/pro';
import { ButtonLink } from '@/components/design-system';

export default function LoginPage() {
  const router = useRouter();
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
      router.push(next && next.startsWith('/') ? next : '/account');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lp lp--inner">
      <section className="shell py-10 md:py-14">
        <section className="public-card mx-auto grid max-w-5xl overflow-hidden md:grid-cols-[0.9fr_1.1fr]">
        <aside className="bg-[var(--ink)] p-6 text-white md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Área privada</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            Tus oportunidades, centralizadas
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/78">
            Accede a tu perfil, revisa promociones guardadas y gestiona tu suscripción VPO PRO.
          </p>
          <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="text-sm font-semibold">¿Aún no tienes PRO?</p>
            <p className="mt-2 text-sm text-white/74">Recibe notificaciones cuando detectemos próximos lanzamientos en tu zona.</p>
            <div className="mt-4">
              <ButtonLink href={proHref} variant="secondary" className="!border-white/20 !bg-white !text-[var(--ink)]">
                {proPlan.ctaLabel}
              </ButtonLink>
            </div>
          </div>
        </aside>

        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-[var(--ink)]">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Accede a tu cuenta y servicios.</p>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-[var(--ink)]">Email</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="ds-control mt-1 w-full" />
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="text-sm font-medium text-[var(--ink)]">Contraseña</label>
                <Link href="/register" className="text-xs font-semibold text-[var(--green-700)]">Crear cuenta</Link>
              </div>
              <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="ds-control mt-1 w-full" />
            </div>
            {error ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="alert" aria-live="polite">{error}</p> : null}
            <button type="submit" disabled={loading} className="btn btn--primary btn--lg w-full disabled:opacity-60">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-4 text-sm text-[var(--ink-soft)]">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-[var(--green-700)]">Regístrate</Link>
          </p>
        </div>
        </section>
      </section>
    </main>
  );
}
