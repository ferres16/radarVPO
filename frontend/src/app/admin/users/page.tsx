'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { BackofficeUser, UserProfile } from '@/types';

type DraftMap = Record<string, { fullName: string; role: 'user' | 'admin'; plan: 'free' | 'pro' }>;

export default function AdminUsersPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<BackofficeUser[]>([]);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const profile = await api.getMe();
        if (!active) return;
        setMe(profile);

        if (profile.role !== 'admin') {
          setError('No tienes permisos de administrador para gestionar usuarios.');
          return;
        }

        const rows = await api.getBackofficeUsers();
        if (!active) return;
        setUsers(rows);
        setDrafts(
          Object.fromEntries(
            rows.map((row) => [
              row.id,
              {
                fullName: row.fullName || '',
                role: row.role,
                plan: row.plan,
              },
            ]),
          ),
        );
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar usuarios');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => Number(b.role === 'admin') - Number(a.role === 'admin')),
    [users],
  );

  async function saveUser(userId: string) {
    const payload = drafts[userId];
    if (!payload) return;

    setSavingId(userId);
    setError('');
    try {
      const updated = await api.updateBackofficeUser(userId, payload);
      setUsers((prev) => prev.map((item) => (item.id === userId ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el usuario');
    } finally {
      setSavingId('');
    }
  }

  if (loading) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <p className="text-sm text-[var(--ink-soft)]">Cargando usuarios...</p>
        </article>
      </main>
    );
  }

  if (error && (!me || me.role !== 'admin')) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Administrar usuarios</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{error}</p>
          <Link href="/admin" className="mt-4 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">
            Volver al panel
          </Link>
        </article>
      </main>
    );
  }

  return (
    <main className="shell space-y-4">
      <header className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Administrar usuarios</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Edita nombre, rol y plan de cada cuenta.
        </p>
      </header>

      {error ? (
        <article className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </article>
      ) : null}

      <section className="space-y-3">
        {sortedUsers.map((user) => {
          const draft = drafts[user.id] || {
            fullName: user.fullName || '',
            role: user.role,
            plan: user.plan,
          };

          return (
            <article key={user.id} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
              <div className="grid gap-3 md:grid-cols-5">
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">Email</p>
                  <p className="text-sm font-semibold text-[var(--ink)]">{user.email}</p>
                </div>
                <label className="text-sm">
                  <span className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">Nombre</span>
                  <input
                    value={draft.fullName}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [user.id]: { ...draft, fullName: e.target.value },
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  <span className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">Rol</span>
                  <select
                    value={draft.role}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [user.id]: { ...draft, role: e.target.value as 'user' | 'admin' },
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </label>
                <label className="text-sm">
                  <span className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">Plan</span>
                  <select
                    value={draft.plan}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [user.id]: { ...draft, plan: e.target.value as 'free' | 'pro' },
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2"
                  >
                    <option value="free">free</option>
                    <option value="pro">pro</option>
                  </select>
                </label>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => void saveUser(user.id)}
                  disabled={savingId === user.id}
                  className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)] disabled:opacity-60"
                >
                  {savingId === user.id ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
