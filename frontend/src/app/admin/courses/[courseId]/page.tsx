'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Course, CourseModule, CourseModuleAsset, UserProfile } from '@/types';

const emptyModule: Partial<CourseModule> = {
  title: '',
  slug: '',
  summary: '',
  body: '',
  position: 0,
};

const formatDateInput = (value?: string | null) => {
  if (!value) return '';
  return value.slice(0, 10);
};

type PageProps = {
  params: { courseId: string };
};

export default function AdminCourseModulesPage({ params }: PageProps) {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Partial<CourseModule>>>({});
  const [newModule, setNewModule] = useState<Partial<CourseModule>>(emptyModule);
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
          setError('No tienes permisos de administrador para gestionar cursos.');
          return;
        }

        const courses = await api.getBackofficeCourses();
        if (!active) return;
        const selected = courses.find((item) => item.id === params.courseId) || null;
        setCourse(selected);
        setModules(selected?.posts || []);
        setDrafts(
          Object.fromEntries(
            (selected?.posts || []).map((module) => [
              module.id,
              {
                title: module.title,
                slug: module.slug,
                summary: module.summary || '',
                body: module.body,
                position: module.position,
                publishedAt: module.publishedAt || '',
              },
            ]),
          ),
        );
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el curso');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [params.courseId]);

  async function createModule() {
    if (!newModule.title || !newModule.slug || !course) {
      setError('Titulo, slug y curso son obligatorios.');
      return;
    }
    setSavingId('new');
    setError('');
    try {
      const created = await api.createBackofficeCourseModule(course.id, {
        title: newModule.title,
        slug: newModule.slug,
        summary: newModule.summary || undefined,
        body: newModule.body || '',
        position: newModule.position || 0,
        publishedAt: newModule.publishedAt || undefined,
      });
      setModules((prev) => [created, ...prev]);
      setDrafts((prev) => ({
        ...prev,
        [created.id]: {
          title: created.title,
          slug: created.slug,
          summary: created.summary || '',
          body: created.body,
          position: created.position,
          publishedAt: created.publishedAt || '',
        },
      }));
      setNewModule(emptyModule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el modulo');
    } finally {
      setSavingId('');
    }
  }

  async function saveModule(moduleId: string) {
    const payload = drafts[moduleId];
    if (!payload) return;
    setSavingId(moduleId);
    setError('');
    try {
      const normalized = {
        ...payload,
        publishedAt: payload.publishedAt ? payload.publishedAt : undefined,
      };
      const updated = await api.updateBackofficeCourseModule(moduleId, normalized);
      setModules((prev) => prev.map((item) => (item.id === moduleId ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el modulo');
    } finally {
      setSavingId('');
    }
  }

  async function deleteModule(moduleId: string) {
    setSavingId(moduleId);
    setError('');
    try {
      await api.deleteBackofficeCourseModule(moduleId);
      setModules((prev) => prev.filter((item) => item.id !== moduleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo borrar el modulo');
    } finally {
      setSavingId('');
    }
  }

  async function uploadAsset(moduleId: string, kind: CourseModuleAsset['kind'], file: File) {
    setSavingId(`${moduleId}-upload`);
    setError('');
    try {
      const asset = await api.uploadBackofficeCourseAsset(moduleId, kind, file);
      setModules((prev) =>
        prev.map((item) =>
          item.id === moduleId
            ? { ...item, assets: [...(item.assets || []), asset] }
            : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo');
    } finally {
      setSavingId('');
    }
  }

  if (loading) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <p className="text-sm text-[var(--ink-soft)]">Cargando modulos...</p>
        </article>
      </main>
    );
  }

  if (error && (!me || me.role !== 'admin')) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Administrar modulos</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{error}</p>
          <Link href="/admin/courses" className="mt-4 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">
            Volver a cursos
          </Link>
        </article>
      </main>
    );
  }

  return (
    <main className="shell space-y-4">
      <header className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Modulos del curso</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          {course ? course.title : 'Curso'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/admin/courses"
            className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
          >
            Volver a cursos
          </Link>
        </div>
      </header>

      {error ? (
        <article className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </article>
      ) : null}

      <section className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Nuevo modulo</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            value={newModule.title || ''}
            onChange={(e) => setNewModule((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Titulo"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          />
          <input
            value={newModule.slug || ''}
            onChange={(e) => setNewModule((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="modulo-1"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          />
          <input
            value={newModule.summary || ''}
            onChange={(e) => setNewModule((prev) => ({ ...prev, summary: e.target.value }))}
            placeholder="Resumen corto"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm md:col-span-2"
          />
          <textarea
            value={newModule.body || ''}
            onChange={(e) => setNewModule((prev) => ({ ...prev, body: e.target.value }))}
            placeholder="Contenido del modulo"
            className="min-h-[140px] rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm md:col-span-2"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-sm text-[var(--ink)]">
            Orden
            <input
              type="number"
              value={newModule.position || 0}
              onChange={(e) => setNewModule((prev) => ({ ...prev, position: Number(e.target.value) }))}
              className="ml-2 w-20 rounded-xl border border-[var(--stroke)] px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm text-[var(--ink)]">
            Publicado
            <input
              type="date"
              value={formatDateInput(newModule.publishedAt as string)}
              onChange={(e) => setNewModule((prev) => ({ ...prev, publishedAt: e.target.value }))}
              className="ml-2 rounded-xl border border-[var(--stroke)] px-2 py-1 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => void createModule()}
            disabled={savingId === 'new'}
            className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)] disabled:opacity-60"
          >
            {savingId === 'new' ? 'Creando...' : 'Crear modulo'}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {modules.map((module) => {
          const draft = drafts[module.id] || {};
          return (
            <article key={module.id} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={draft.title || ''}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [module.id]: { ...draft, title: e.target.value },
                    }))
                  }
                  className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                />
                <input
                  value={draft.slug || ''}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [module.id]: { ...draft, slug: e.target.value },
                    }))
                  }
                  className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                />
                <input
                  value={draft.summary || ''}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [module.id]: { ...draft, summary: e.target.value },
                    }))
                  }
                  className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm md:col-span-2"
                />
                <textarea
                  value={draft.body || ''}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [module.id]: { ...draft, body: e.target.value },
                    }))
                  }
                  className="min-h-[140px] rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm md:col-span-2"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="text-sm text-[var(--ink)]">
                  Orden
                  <input
                    type="number"
                    value={draft.position ?? 0}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [module.id]: { ...draft, position: Number(e.target.value) },
                      }))
                    }
                    className="ml-2 w-20 rounded-xl border border-[var(--stroke)] px-2 py-1 text-sm"
                  />
                </label>
                <label className="text-sm text-[var(--ink)]">
                  Publicado
                  <input
                    type="date"
                    value={formatDateInput(draft.publishedAt as string)}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [module.id]: { ...draft, publishedAt: e.target.value },
                      }))
                    }
                    className="ml-2 rounded-xl border border-[var(--stroke)] px-2 py-1 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void saveModule(module.id)}
                  disabled={savingId === module.id}
                  className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)] disabled:opacity-60"
                >
                  {savingId === module.id ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteModule(module.id)}
                  disabled={savingId === module.id}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                >
                  Borrar
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Multimedia</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="text-xs font-semibold text-[var(--ink)]">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void uploadAsset(module.id, 'image', file);
                        }
                      }}
                    />
                    <span className="cursor-pointer rounded-full border border-[var(--stroke)] bg-white px-3 py-1">Subir imagen</span>
                  </label>
                  <label className="text-xs font-semibold text-[var(--ink)]">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void uploadAsset(module.id, 'video', file);
                        }
                      }}
                    />
                    <span className="cursor-pointer rounded-full border border-[var(--stroke)] bg-white px-3 py-1">Subir video</span>
                  </label>
                  <label className="text-xs font-semibold text-[var(--ink)]">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void uploadAsset(module.id, 'file', file);
                        }
                      }}
                    />
                    <span className="cursor-pointer rounded-full border border-[var(--stroke)] bg-white px-3 py-1">Subir archivo</span>
                  </label>
                  {savingId === `${module.id}-upload` ? (
                    <span className="text-xs text-[var(--ink-soft)]">Subiendo...</span>
                  ) : null}
                </div>
                {module.assets && module.assets.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {module.assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-xs">
                        <span>{asset.originalName || asset.publicUrl}</span>
                        <a href={asset.publicUrl} className="font-semibold text-[var(--green-700)]">Ver</a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-[var(--ink-soft)]">Sin archivos subidos.</p>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
