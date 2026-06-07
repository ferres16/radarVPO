'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

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
      router.push(next && next.startsWith('/') ? next : '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--stroke)] bg-white shadow-card md:grid-cols-[0.9fr_1.1fr] animate-fade-up">
        <aside className="bg-[linear-gradient(145deg,var(--green-900),var(--green-700))] p-6 text-white md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">Área privada</p>
          <h1 className="display-type mt-4 text-3xl font-black leading-tight md:text-4xl">Gestiona tus viviendas guardadas y avisos</h1>
          <p className="mt-4 text-sm leading-6 text-white/78">
            Accede a tu perfil para revisar estado, documentación, favoritos y próximas oportunidades.
          </p>
          <div className="mt-6 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm font-semibold">Consejo de seguridad</p>
            <p className="mt-2 text-sm text-white/74">Usa una contraseña única y revisa siempre que la URL sea la oficial de Radar VPO.</p>
          </div>
        </aside>

        <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold text-[var(--ink)]">Iniciar sesión</h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Accede a tu cuenta, avisos y servicios.</p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-[var(--ink)]">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-2xl border border-[var(--stroke)] px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]" />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="password" className="text-sm font-medium text-[var(--ink)]">Contraseña</label>
              <Link href="/register" className="text-xs font-semibold text-[var(--green-700)]">¿Necesitas cuenta?</Link>
            </div>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-2xl border border-[var(--stroke)] px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]" />
          </div>
          {error ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="alert" aria-live="polite">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[var(--green-700)] px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--green-900)] disabled:opacity-60">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-sm text-[var(--ink-soft)]">
          No tienes cuenta?{' '}
          <Link href="/register" className="font-semibold text-[var(--green-700)]">Registrate</Link>
        </p>
        </div>
      </section>
    </main>
  );
}
