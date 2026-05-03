'use client';

import { FormEvent, useState } from 'react';
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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.register(email, password, fullName, phone);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="mx-auto max-w-md rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Crear cuenta</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Guarda filtros y recibe alertas personalizadas.</p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="fullName" className="text-sm font-medium text-[var(--ink)]">Nombre completo</label>
            <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]" />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-[var(--ink)]">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]" />
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-[var(--ink)]">Telefono</label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-[var(--ink)]">Contrasena</label>
            <input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]" />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-[var(--green-500)] px-4 py-2 font-semibold text-white hover:bg-[var(--green-700)] disabled:opacity-60">
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-4 text-sm text-[var(--ink-soft)]">
          Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-[var(--green-700)]">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
