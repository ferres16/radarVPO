import Link from 'next/link';
import { api } from '@/lib/api';

export default async function AccountPage() {
  const me = await api.getMe().catch(() => null);

  if (!me) {
    return (
      <main className="shell">
        <article className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Tu cuenta</h1>
          <p className="mt-2 text-[var(--ink-soft)]">Para ver tus datos de perfil necesitas iniciar sesion.</p>
          <Link href="/login" className="mt-4 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">
            Iniciar sesion
          </Link>
        </article>
      </main>
    );
  }

  return (
    <main className="shell">
      <article className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Tu cuenta</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Datos de perfil y plan actual.</p>

        <dl className="mt-5 grid gap-3 text-sm">
          <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3">
            <dt className="text-[var(--ink-soft)]">Nombre</dt>
            <dd className="font-semibold text-[var(--ink)]">{me.fullName || 'Sin nombre'}</dd>
          </div>
          <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3">
            <dt className="text-[var(--ink-soft)]">Email</dt>
            <dd className="font-semibold text-[var(--ink)]">{me.email}</dd>
          </div>
          <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3">
            <dt className="text-[var(--ink-soft)]">Rol</dt>
            <dd className="font-semibold text-[var(--ink)]">{me.role}</dd>
          </div>
          <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3">
            <dt className="text-[var(--ink-soft)]">Plan</dt>
            <dd className="font-semibold text-[var(--ink)]">{me.plan}</dd>
          </div>
        </dl>
      </article>
    </main>
  );
}
