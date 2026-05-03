'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Course, UserProfile } from '@/types';

const emptyCourse: Partial<Course> = {
  title: '',
  slug: '',
  description: '',
  active: true,
};

export default function AdminCoursesPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Partial<Course>>>({});
  const [newCourse, setNewCourse] = useState<Partial<Course>>(emptyCourse);
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
        const rows = await api.getBackofficeCourses();
        if (!active) return;
        setCourses(rows);
        setDrafts(
          Object.fromEntries(
            rows.map((course) => [
              course.id,
              {
                title: course.title,
                slug: course.slug,
                description: course.description || '',
                active: course.active,
              },
            ]),
          ),
        );
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar cursos');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function saveCourse(courseId: string) {
    const payload = drafts[courseId];
    if (!payload) return;
    setSavingId(courseId);
    setError('');
    try {
      const updated = await api.updateBackofficeCourse(courseId, payload);
      setCourses((prev) => prev.map((item) => (item.id === courseId ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el curso');
    } finally {
      setSavingId('');
    }
  }

  async function createCourse() {
    if (!newCourse.title || !newCourse.slug) {
      setError('Titulo y slug son obligatorios.');
      return;
    }
    setSavingId('new');
    setError('');
    try {
      const created = await api.createBackofficeCourse({
        title: newCourse.title,
        slug: newCourse.slug,
        description: newCourse.description || undefined,
        active: newCourse.active ?? true,
      });
      setCourses((prev) => [created, ...prev]);
      setDrafts((prev) => ({
        ...prev,
        [created.id]: {
          title: created.title,
          slug: created.slug,
          description: created.description || '',
          active: created.active,
        },
      }));
      setNewCourse(emptyCourse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el curso');
    } finally {
      setSavingId('');
    }
  }

  async function deleteCourse(courseId: string) {
    setSavingId(courseId);
    setError('');
    try {
      await api.deleteBackofficeCourse(courseId);
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo borrar el curso');
    } finally {
      setSavingId('');
    }
  }

  if (loading) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <p className="text-sm text-[var(--ink-soft)]">Cargando cursos...</p>
        </article>
      </main>
    );
  }

  if (error && (!me || me.role !== 'admin')) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Administrar cursos</h1>
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
        <h1 className="text-2xl font-bold text-[var(--ink)]">Administrar cursos</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Crea cursos, activa o desactiva y entra en cada uno para gestionar modulos.
        </p>
      </header>

      {error ? (
        <article className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </article>
      ) : null}

      <section className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Nuevo curso</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <input
            value={newCourse.title || ''}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Titulo"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          />
          <input
            value={newCourse.slug || ''}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="slug-guia-pro"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          />
          <input
            value={newCourse.description || ''}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Descripcion corta"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm md:col-span-2"
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              checked={newCourse.active ?? true}
              onChange={(e) => setNewCourse((prev) => ({ ...prev, active: e.target.checked }))}
            />
            Activo
          </label>
          <button
            type="button"
            onClick={() => void createCourse()}
            disabled={savingId === 'new'}
            className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)] disabled:opacity-60"
          >
            {savingId === 'new' ? 'Creando...' : 'Crear curso'}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {courses.map((course) => {
          const draft = drafts[course.id] || {};
          return (
            <article key={course.id} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  value={draft.title || ''}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [course.id]: { ...draft, title: e.target.value },
                    }))
                  }
                  className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                />
                <input
                  value={draft.slug || ''}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [course.id]: { ...draft, slug: e.target.value },
                    }))
                  }
                  className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                />
                <input
                  value={draft.description || ''}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [course.id]: { ...draft, description: e.target.value },
                    }))
                  }
                  className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm md:col-span-2"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
                  <input
                    type="checkbox"
                    checked={draft.active ?? false}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [course.id]: { ...draft, active: e.target.checked },
                      }))
                    }
                  />
                  Activo
                </label>
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-app)]"
                >
                  Gestionar modulos
                </Link>
                <button
                  type="button"
                  onClick={() => void saveCourse(course.id)}
                  disabled={savingId === course.id}
                  className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)] disabled:opacity-60"
                >
                  {savingId === course.id ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteCourse(course.id)}
                  disabled={savingId === course.id}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                >
                  Borrar
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
