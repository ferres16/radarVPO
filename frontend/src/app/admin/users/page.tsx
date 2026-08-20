'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { EmptyState } from '@/components/empty-state';
import { SkeletonCard } from '@/components/skeleton-card';
import { StatusPill } from '@/components/status-pill';
import { api } from '@/lib/api';
import type { BackofficeUser, UserProfile } from '@/types';

type UserDraft = {
  fullName: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro';
  stripeCustomerId: string;
};

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
  const [selectedUserId, setSelectedUserId] = useState('');
  const [draft, setDraft] = useState<UserDraft | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

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
        setUsers(rows);
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
        const pending =
          Number(Boolean(b.proCancellationRequestedAt)) -
          Number(Boolean(a.proCancellationRequestedAt));
        if (pending !== 0) return pending;
        return Number(b.role === 'admin') - Number(a.role === 'admin');
      }),
    [users],
  );

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) || null,
    [selectedUserId, users],
  );

  async function searchUsers() {
    setError('');
    try {
      const rows = await api.getBackofficeUsers(query.trim() || undefined);
      setUsers(rows);
      if (selectedUserId && !rows.some((row) => row.id === selectedUserId)) {
        setSelectedUserId('');
        setDraft(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo buscar usuarios');
    }
  }

  function selectUser(user: BackofficeUser) {
    setSelectedUserId(user.id);
    setDraft(toDraft(user));
    setError('');
  }

  async function saveUser() {
    if (!selectedUser || !draft) return;
    setSaving(true);
    setError('');
    try {
      const updated = await api.updateBackofficeUser(selectedUser.id, {
        fullName: draft.fullName,
        role: draft.role,
        plan: draft.plan,
        stripeCustomerId: draft.stripeCustomerId.trim() || null,
      });
      setUsers((prev) =>
        prev.map((item) => (item.id === selectedUser.id ? { ...item, ...updated } : item)),
      );
      setDraft(toDraft({ ...selectedUser, ...updated }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el usuario');
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser() {
    if (!selectedUser) return;
    const accepted = window.confirm(
      `¿Eliminar permanentemente a ${selectedUser.email}? Esta acción no se puede deshacer.`,
    );
    if (!accepted) return;

    setDeleting(true);
    setError('');
    try {
      await api.deleteBackofficeUser(selectedUser.id);
      setUsers((prev) => prev.filter((item) => item.id !== selectedUser.id));
      setSelectedUserId('');
      setDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="shell grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </main>
    );
  }

  if (error && (!me || me.role !== 'admin')) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Administrar usuarios</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{error}</p>
          <Link
            href="/admin"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white"
          >
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
          <header className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--green-700)]">
              Backoffice
            </p>
            <h1 className="display-type mt-2 text-3xl font-black text-[var(--ink)]">
              Administrar usuarios
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              Busca por email, nombre, teléfono o Customer ID. Al activar PRO pega el Stripe Customer
              ID (`cus_...`) del cobro.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/admin/access"
                className="rounded-xl border border-[var(--stroke)] px-4 py-2 text-sm font-semibold text-[var(--ink)]"
              >
                Activaciones
              </Link>
              <Link
                href="/admin/cancellations"
                className="rounded-xl border border-[var(--stroke)] px-4 py-2 text-sm font-semibold text-[var(--ink)]"
              >
                Bajas PRO
              </Link>
            </div>
          </header>

          {error ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {error}
            </div>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <aside className="rounded-3xl border border-[var(--stroke)] bg-white p-4 shadow-card">
              <label className="text-sm font-semibold text-[var(--ink)]">
                Buscar usuario
                <div className="mt-2 flex gap-2">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void searchUsers();
                    }}
                    placeholder="Email, teléfono o cus_..."
                    className="min-w-0 flex-1 rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => void searchUsers()}
                    className="rounded-xl bg-[var(--green-500)] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Buscar
                  </button>
                </div>
              </label>
              <div className="mt-4 space-y-2">
                {sortedUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => selectUser(user)}
                    className={`w-full rounded-2xl border p-3 text-left text-sm transition ${
                      selectedUserId === user.id
                        ? 'border-[var(--green-500)] bg-emerald-50'
                        : 'border-[var(--stroke)] bg-white hover:bg-[var(--bg-app)]'
                    }`}
                  >
                    <span className="block font-semibold text-[var(--ink)]">
                      {user.fullName || user.email}
                    </span>
                    <span className="block text-xs text-[var(--ink-soft)]">{user.email}</span>
                    {user.proCancellationRequestedAt ? (
                      <span className="mt-1 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        Baja pendiente
                      </span>
                    ) : null}
                  </button>
                ))}
                {sortedUsers.length === 0 ? (
                  <EmptyState
                    title="Sin usuarios"
                    description="Prueba con otro término de búsqueda."
                  />
                ) : null}
              </div>
            </aside>

            <section className="space-y-4">
              {!selectedUser || !draft ? (
                <EmptyState
                  title="Selecciona un usuario"
                  description="Aquí verás rol, plan, Stripe Customer ID y podrás eliminarlo."
                />
              ) : (
                <article className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                        Usuario
                      </p>
                      <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">
                        {selectedUser.fullName || selectedUser.email}
                      </h2>
                      <p className="text-sm text-[var(--ink-soft)]">{selectedUser.email}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">
                        Teléfono: {selectedUser.phone || '—'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill
                        label={selectedUser.plan}
                        tone={selectedUser.plan === 'pro' ? 'active' : 'neutral'}
                      />
                      <StatusPill
                        label={selectedUser.role}
                        tone={selectedUser.role === 'admin' ? 'warning' : 'neutral'}
                      />
                      {selectedUser.proCancellationRequestedAt ? (
                        <Link
                          href="/admin/cancellations"
                          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800"
                        >
                          Baja pendiente
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <label className="text-sm sm:col-span-2">
                      <span className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">
                        Nombre
                      </span>
                      <input
                        value={draft.fullName}
                        onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                        className="mt-1 min-h-11 w-full rounded-xl border border-[var(--stroke)] px-3 py-2"
                      />
                    </label>
                    <label className="text-sm sm:col-span-2">
                      <span className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">
                        Stripe Customer ID
                      </span>
                      <input
                        value={draft.stripeCustomerId}
                        onChange={(e) =>
                          setDraft({ ...draft, stripeCustomerId: e.target.value })
                        }
                        placeholder="cus_..."
                        className="mt-1 min-h-11 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 font-mono text-sm"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">
                        Rol
                      </span>
                      <select
                        value={draft.role}
                        onChange={(e) =>
                          setDraft({ ...draft, role: e.target.value as 'user' | 'admin' })
                        }
                        className="mt-1 min-h-11 w-full rounded-xl border border-[var(--stroke)] px-3 py-2"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </label>
                    <label className="text-sm">
                      <span className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">
                        Plan
                      </span>
                      <select
                        value={draft.plan}
                        onChange={(e) =>
                          setDraft({ ...draft, plan: e.target.value as 'free' | 'pro' })
                        }
                        className="mt-1 min-h-11 w-full rounded-xl border border-[var(--stroke)] px-3 py-2"
                      >
                        <option value="free">free</option>
                        <option value="pro">pro</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() => void deleteUser()}
                      disabled={deleting || selectedUser.id === me?.id}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                    >
                      {deleting ? 'Eliminando...' : 'Eliminar usuario'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void saveUser()}
                      disabled={saving}
                      className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </article>
              )}
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
