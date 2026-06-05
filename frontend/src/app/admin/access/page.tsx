'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { SkeletonCard } from '@/components/skeleton-card';
import { StatusPill } from '@/components/status-pill';
import { api } from '@/lib/api';
import type {
  BackofficeAccessDetail,
  BackofficeAccessRecord,
  BackofficeUser,
  Course,
  Service,
  UserProfile,
} from '@/types';

type DraftAccess = {
  isActive: boolean;
  notes: string;
};

export default function AdminAccessPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<BackofficeUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [detail, setDetail] = useState<BackofficeAccessDetail | null>(null);
  const [courseDrafts, setCourseDrafts] = useState<Record<string, DraftAccess>>({});
  const [serviceDrafts, setServiceDrafts] = useState<Record<string, DraftAccess>>({});
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingKey, setSavingKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const profile = await api.getMe();
        if (!active) return;
        setMe(profile);
        if (profile.role !== 'admin') {
          setError('No tienes permisos de administrador.');
          return;
        }
        const rows = await api.getBackofficeAccessUsers();
        if (!active) return;
        setUsers(rows);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar activaciones');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) || detail?.user || null,
    [detail, selectedUserId, users],
  );

  async function searchUsers() {
    setError('');
    try {
      const rows = await api.getBackofficeAccessUsers(query);
      setUsers(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo buscar usuarios');
    }
  }

  async function loadUser(userId: string) {
    setSelectedUserId(userId);
    setLoadingDetail(true);
    setError('');
    try {
      const next = await api.getBackofficeAccessUser(userId);
      setDetail(next);
      setCourseDrafts(buildCourseDrafts(next.courses, next.courseAccesses));
      setServiceDrafts(buildServiceDrafts(next.services, next.serviceAccesses));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el usuario');
    } finally {
      setLoadingDetail(false);
    }
  }

  async function saveCourseAccess(course: Course) {
    if (!detail) return;
    const draft = courseDrafts[course.id];
    setSavingKey(`course-${course.id}`);
    setError('');
    try {
      await api.updateBackofficeCourseAccess(detail.user.id, course.id, {
        isActive: draft?.isActive ?? false,
        notes: draft?.notes,
      });
      await loadUser(detail.user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el curso');
    } finally {
      setSavingKey('');
    }
  }

  async function saveServiceAccess(service: Service) {
    if (!detail) return;
    const draft = serviceDrafts[service.id];
    setSavingKey(`service-${service.id}`);
    setError('');
    try {
      await api.updateBackofficeServiceAccess(detail.user.id, service.id, {
        isActive: draft?.isActive ?? false,
        notes: draft?.notes,
      });
      await loadUser(detail.user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el servicio');
    } finally {
      setSavingKey('');
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
          <h1 className="text-2xl font-bold text-[var(--ink)]">Compras y Activaciones</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{error}</p>
        </article>
      </main>
    );
  }

  return (
    <main className="shell space-y-4 pb-16">
      <header className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--green-700)]">Backoffice</p>
        <h1 className="display-type mt-2 text-3xl font-black text-[var(--ink)]">Compras y Activaciones</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
          Stripe cobra mediante Payment Links. El acceso real vive en la base de datos y se activa manualmente aqui.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/services" className="rounded-xl border border-[var(--stroke)] px-4 py-2 text-sm font-semibold text-[var(--ink)]">Servicios</Link>
          <Link href="/admin/courses" className="rounded-xl border border-[var(--stroke)] px-4 py-2 text-sm font-semibold text-[var(--ink)]">Cursos</Link>
        </div>
      </header>

      {error ? <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{error}</div> : null}

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
                placeholder="Email, nombre o telefono"
                className="min-w-0 flex-1 rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
              />
              <button type="button" onClick={() => void searchUsers()} className="rounded-xl bg-[var(--green-500)] px-3 py-2 text-sm font-semibold text-white">
                Buscar
              </button>
            </div>
          </label>
          <div className="mt-4 space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => void loadUser(user.id)}
                className={`w-full rounded-2xl border p-3 text-left text-sm transition ${
                  selectedUserId === user.id
                    ? 'border-[var(--green-500)] bg-emerald-50'
                    : 'border-[var(--stroke)] bg-white hover:bg-[var(--bg-app)]'
                }`}
              >
                <span className="block font-semibold text-[var(--ink)]">{user.fullName || user.email}</span>
                <span className="block text-xs text-[var(--ink-soft)]">{user.email}</span>
              </button>
            ))}
            {users.length === 0 ? (
              <EmptyState title="Sin usuarios" description="Prueba con otro termino de busqueda." />
            ) : null}
          </div>
        </aside>

        <section className="space-y-4">
          {!selectedUser ? (
            <EmptyState title="Selecciona un usuario" description="Aqui veras cursos comprados, servicios activos y toggles de activacion." />
          ) : null}

          {selectedUser ? (
            <article className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Usuario</p>
                  <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">{selectedUser.fullName || selectedUser.email}</h2>
                  <p className="text-sm text-[var(--ink-soft)]">{selectedUser.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill label={selectedUser.plan} tone={selectedUser.plan === 'pro' ? 'active' : 'neutral'} />
                  <StatusPill label={selectedUser.role} tone={selectedUser.role === 'admin' ? 'warning' : 'neutral'} />
                </div>
              </div>
            </article>
          ) : null}

          {loadingDetail ? (
            <SkeletonCard />
          ) : detail ? (
            <>
              <AccessGroup
                title="Cursos"
                items={detail.courses}
                drafts={courseDrafts}
                savingPrefix="course"
                savingKey={savingKey}
                onDraftChange={(id, draft) => setCourseDrafts((prev) => ({ ...prev, [id]: draft }))}
                onSave={(item) => void saveCourseAccess(item as Course)}
                getName={(item) => (item as Course).title}
                getMeta={(item) => `${(item as Course).accessType} · ${(item as Course).status}`}
              />
              <AccessGroup
                title="Servicios"
                items={detail.services}
                drafts={serviceDrafts}
                savingPrefix="service"
                savingKey={savingKey}
                onDraftChange={(id, draft) => setServiceDrafts((prev) => ({ ...prev, [id]: draft }))}
                onSave={(item) => void saveServiceAccess(item as Service)}
                getName={(item) => (item as Service).name}
                getMeta={(item) => `${(item as Service).key} · ${(item as Service).serviceType}`}
              />
            </>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function buildCourseDrafts(courses: Course[], accesses: Array<BackofficeAccessRecord & { courseId: string }>) {
  return Object.fromEntries(
    courses.map((course) => {
      const access = accesses.find((item) => item.courseId === course.id);
      return [course.id, { isActive: Boolean(access?.isActive), notes: access?.notes || '' }];
    }),
  );
}

function buildServiceDrafts(services: Service[], accesses: Array<BackofficeAccessRecord & { serviceId: string }>) {
  return Object.fromEntries(
    services.map((service) => {
      const access = accesses.find((item) => item.serviceId === service.id);
      return [service.id, { isActive: Boolean(access?.isActive), notes: access?.notes || '' }];
    }),
  );
}

function AccessGroup({
  title,
  items,
  drafts,
  savingPrefix,
  savingKey,
  onDraftChange,
  onSave,
  getName,
  getMeta,
}: {
  title: string;
  items: Array<Course | Service>;
  drafts: Record<string, DraftAccess>;
  savingPrefix: string;
  savingKey: string;
  onDraftChange: (id: string, draft: DraftAccess) => void;
  onSave: (item: Course | Service) => void;
  getName: (item: Course | Service) => string;
  getMeta: (item: Course | Service) => string;
}) {
  return (
    <article className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
      <h2 className="text-xl font-black text-[var(--ink)]">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const draft = drafts[item.id] || { isActive: false, notes: '' };
          const itemSavingKey = `${savingPrefix}-${item.id}`;
          return (
            <div key={item.id} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--ink)]">{getName(item)}</p>
                  <p className="text-xs text-[var(--ink-soft)]">{getMeta(item)}</p>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(event) => onDraftChange(item.id, { ...draft, isActive: event.target.checked })}
                    className="h-4 w-4"
                  />
                  {draft.isActive ? 'Activo' : 'Inactivo'}
                </label>
              </div>
              <textarea
                value={draft.notes}
                onChange={(event) => onDraftChange(item.id, { ...draft, notes: event.target.value })}
                placeholder="Notas internas de compra, comprobante, incidencia..."
                className="mt-3 min-h-20 w-full rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => onSave(item)}
                className="mt-3 rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={savingKey === itemSavingKey}
              >
                {savingKey === itemSavingKey ? 'Guardando...' : 'Guardar acceso'}
              </button>
            </div>
          );
        })}
      </div>
    </article>
  );
}
