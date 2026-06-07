'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.register(email, password, fullName, phone);
      router.push('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--stroke)] bg-white shadow-card md:grid-cols-[1.05fr_0.95fr] animate-fade-up">
        <div className="p-6 md:p-8">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Crear cuenta</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Guarda filtros, viviendas favoritas y recibe avisos personalizados.</p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="fullName" className="text-sm font-medium text-[var(--ink)]">Nombre completo</label>
            <input id="fullName" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 w-full rounded-2xl border border-[var(--stroke)] px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]" />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-[var(--ink)]">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-2xl border border-[var(--stroke)] px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]" />
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-[var(--ink)]">Teléfono</label>
            <input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 w-full rounded-2xl border border-[var(--stroke)] px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-[var(--ink)]">Contraseña</label>
            <input id="password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required aria-describedby="password-help" className="mt-1 w-full rounded-2xl border border-[var(--stroke)] px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]" />
            <div className="mt-2" id="password-help">
              <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-app)]" aria-hidden="true">
                <div className="h-full rounded-full bg-[var(--green-700)] transition-all" style={{ width: `${Math.max(passwordScore, 1) * 25}%` }} />
              </div>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">Fortaleza: {passwordLabel}. Usa 8 caracteres, mayúsculas, números y símbolos.</p>
            </div>
          </div>
          {error ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="alert" aria-live="polite">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[var(--green-700)] px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--green-900)] disabled:opacity-60">
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-4 text-sm text-[var(--ink-soft)]">
          Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-[var(--green-700)]">Entrar</Link>
        </p>
        </div>

        <aside className="bg-[linear-gradient(145deg,#f8fbfd,#edf7f2)] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Perfil ciudadano</p>
          <h2 className="display-type mt-4 text-3xl font-black text-[var(--ink)]">Un espacio para seguir tus oportunidades</h2>
          <div className="mt-6 space-y-3">
            {['Favoritos y viviendas guardadas', 'Avisos por municipio y régimen', 'Historial y documentación preparada'].map((item) => (
              <div key={item} className="rounded-2xl border border-[var(--stroke)] bg-white/82 p-4 text-sm font-semibold text-[var(--ink)] shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
