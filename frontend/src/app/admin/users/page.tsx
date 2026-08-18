'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { api } from '@/lib/api';
import type { BackofficeUser, UserProfile } from '@/types';

type UserDraft = {
  fullName: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro';
  stripeCustomerId: string;
};

type DraftMap = Record<string, UserDraft>;

function toDraft(user: BackofficeUser): UserDraft {
  return {
    fullName: user.fullName || '',
    role: user.role,
    plan: user.plan,
    stripeCustomerId: user.stripeCustomerId || '',
  };
}

export default function AdminUsersPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<BackofficeUser[]>([]);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

  function applyUsers(rows: BackofficeUser[]) {
    setUsers(rows);
    setDrafts(Object.fromEntries(rows.map((row) => [row.id, toDraft(row)])));
  }

  async function loadUsers(search = query) {
    const rows = await api.getBackofficeUsers(search.trim() || undefined);
    applyUsers(rows);
  }

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

        const initialQuery =
          typeof window === 'undefined'
            ? ''
            : new URLSearchParams(window.location.search).get('q') || '';
        if (initialQuery) setQuery(initialQuery);
        const rows = await api.getBackofficeUsers(initialQuery.trim() || undefined);
        if (!active) return;
        applyUsers(rows);
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
    () =>
      [...users].sort((a, b) => {
        const pending = Number(Boolean(b.proCancellationRequestedAt)) - Number(Boolean(a.proCancellationRequestedAt));
        if (pending !== 0) return pending;
        return Number(b.role === 'admin') - Number(a.role === 'admin');
      }),
    [users],
  );

  async function saveUser(userId: string) {
    const payload = drafts[userId];
    if (!payload) return;

    setSavingId(userId);
    setError('');
    try {
      const updated = await api.updateBackofficeUser(userId, {
        fullName: payload.fullName,
        role: payload.role,
        plan: payload.plan,
        stripeCustomerId: payload.stripeCustomerId.trim() || null,
      });
      setUsers((prev) =>
        prev.map((item) => (item.id === userId ? { ...item, ...updated } : item)),
      );
      setDrafts((prev) => ({
        ...prev,
        [userId]: toDraft({ ...users.find((item) => item.id === userId), ...updated }),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el usuario');
    } finally {
      setSavingId('');
    }
  }

  if (loading) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6">
          <p className="text-sm text-[var(--ink-soft)]">Cargando usuarios...</p>
        </article>
      </main>
    );
  }

  if (error && (!me || me.role !== 'admin')) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Administrar usuarios</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{error}</p>
          <Link href="/admin" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white">
            Volver al panel
          </Link>
        </article>
      </main>
    );
  }

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-4">
          <header className="rounded-3xl border border-[var(--stroke)] bg-white p-6">
            <h1 className="text-2xl font-bold text-[var(--ink)]">Administrar usuarios</h1>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Busca por email, nombre, teléfono o Customer ID. Al activar PRO pega el Stripe Customer ID (`cus_...`) del cobro.
            </p>
            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                void loadUsers();
              }}
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Email, teléfono o cus_..."
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
              />
              <button type="submit" className="btn btn--primary min-h-11 w-full sm:w-auto">
                Buscar
              </button>
            </form>
          </header>

          {error ? (
            <article className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {error}
            </article>
          ) : null}

          <section className="space-y-3">
            {sortedUsers.map((user) => {
              const draft = drafts[user.id] || toDraft(user);

              return (
                <article key={user.id} className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">Email</p>
                      <p className="break-all text-sm font-semibold text-[var(--ink)]">{user.email}</p>
                      <p className="mt-2 text-xs uppercase tracking-wide text-[var(--ink-soft)]">Teléfono</p>
                      <p className="text-sm font-semibold text-[var(--ink)]">{user.phone || '-'}</p>
                    </div>
                    {user.proCancellationRequestedAt ? (
                      <Link
                        href="/admin/cancellations"
                        className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800"
                      >
                        Baja pendiente
                      </Link>
                    ) : null}
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                        className="mt-1 min-h-11 w-full rounded-xl border border-[var(--stroke)] px-3 py-2"
                      />
                    </label>
                    <label className="text-sm sm:col-span-2">
                      <span className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">Stripe Customer ID</span>
                      <input
                        value={draft.stripeCustomerId}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [user.id]: { ...draft, stripeCustomerId: e.target.value },
                          }))
                        }
                        placeholder="cus_..."
                        className="mt-1 min-h-11 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 font-mono text-sm"
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
                        className="mt-1 min-h-11 w-full rounded-xl border border-[var(--stroke)] px-3 py-2"
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
                        className="mt-1 min-h-11 w-full rounded-xl border border-[var(--stroke)] px-3 py-2"
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
                      className="btn btn--primary min-h-11 w-full sm:w-auto"
                    >
                      {savingId === user.id ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </article>
              );
            })}
            {sortedUsers.length === 0 ? (
              <p className="rounded-2xl border border-[var(--stroke)] bg-white p-4 text-sm text-[var(--ink-soft)]">
                No hay usuarios con ese criterio.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
