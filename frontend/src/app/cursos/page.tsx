'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { Course, CourseAccessDecision } from '@/types';

const accessLabels: Record<string, string> = {
  free: 'Gratis',
  paid: 'Pago unico',
  pro: 'Plan PRO',
  seguimiento: 'Seguimiento',
};

const accessTone: Record<string, string> = {
  free: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-amber-100 text-amber-800',
  pro: 'bg-indigo-100 text-indigo-700',
  seguimiento: 'bg-slate-900 text-white',
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [accessMap, setAccessMap] = useState<Record<string, CourseAccessDecision>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const list = await api.listCourses();
        if (!active) return;
        setCourses(list);
        setError('');
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

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const list = await api.listCoursesForUser();
        if (!active) return;
        setAccessMap(
          Object.fromEntries(
            list.map((course) => [course.id, course.access || { canAccess: false, reason: 'locked' }]),
          ),
        );
      } catch {
        if (!active) return;
        setAccessMap({});
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const visibleCourses = useMemo(
    () => [...courses].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    [courses],
  );

  if (loading) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <p className="text-sm text-[var(--ink-soft)]">Cargando cursos...</p>
        </article>
      </main>
    );
  }

  return (
    <main className="shell space-y-6 pb-16">
      <header className="relative overflow-hidden rounded-[2.5rem] border border-[var(--stroke)] bg-[radial-gradient(circle_at_top,#ecfdf5,white_60%)] p-6 shadow-card sm:p-10">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[rgba(59,130,246,0.16)] blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[rgba(16,185,129,0.18)] blur-3xl" />
        <div className="relative space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-soft)]">Cursos Radar VPO</p>
          <h1 className="text-4xl font-black text-[var(--ink)] display-type sm:text-5xl">
            Aprende, desbloquea y avanza con guias vivas.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            Cursos estructurados por modulos, progreso guardado y acceso segun tu plan. Todo el contenido se gestiona desde admin.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-white">Contenido vivo</span>
            <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ink)]">Editor moderno</span>
            <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ink)]">Progreso visual</span>
          </div>
        </div>
      </header>

      {error ? (
        <article className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </article>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleCourses.map((course) => {
          const access = accessMap[course.id];
          const badge = accessLabels[course.accessType] || 'Acceso';
          const isLocked = access ? !access.canAccess : course.accessType !== 'free';
          return (
            <article key={course.id} className="group relative overflow-hidden rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card transition hover:-translate-y-1">
              <div className="absolute -right-10 top-6 h-24 w-24 rounded-full bg-[rgba(14,116,144,0.08)] blur-2xl" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accessTone[course.accessType] || 'bg-slate-100 text-slate-700'}`}>
                    {badge}
                  </span>
                  <span className={`text-xs font-semibold ${isLocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isLocked ? 'Bloqueado' : 'Disponible'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-[var(--ink)] display-type">
                    {course.title}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    {course.shortDescription || 'Curso sin descripcion corta.'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                    {course.modules?.length ?? 0} modulos
                  </span>
                  <Link
                    href={`/cursos/${course.slug}`}
                    className="rounded-full bg-[var(--green-500)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--green-700)]"
                  >
                    Ver curso
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
