'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Course, CourseAccessDecision } from '@/types';

const isExternalUrl = (href: string) => /^https?:\/\//.test(href);

export default function CourseDetailPage() {
  const params = useParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [course, setCourse] = useState<Course | null>(null);
  const [access, setAccess] = useState<CourseAccessDecision | null>(null);
  const [progress, setProgress] = useState<{
    progressPercent: number;
    completedLessons: number;
    totalLessons: number;
  } | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authed' | 'guest'>('loading');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await api.getCourse(slug);
        if (!active) return;
        setCourse(data);
        setError('');
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
  }, [slug]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        await api.getMe();
        if (!active) return;
        setAuthStatus('authed');
        const data = await api.getCourseForUser(slug);
        if (!active) return;
        setAccess(data.access || null);
        const courseProgress = await api.getCourseProgress(slug);
        if (!active) return;
        setProgress({
          progressPercent: courseProgress.progressPercent,
          completedLessons: courseProgress.completedLessons,
          totalLessons: courseProgress.totalLessons,
        });
      } catch {
        if (!active) return;
        setAccess(null);
        setAuthStatus('guest');
      }
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  const modules = useMemo(() => course?.modules || [], [course]);
  const locked = access ? !access.canAccess : course?.accessType !== 'free';
  const progressPercent = progress?.progressPercent ?? 0;
  const purchaseHref = course?.stripePaymentLink || '/services';
  const purchaseExternal = isExternalUrl(purchaseHref);

  if (loading) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <p className="text-sm text-[var(--ink-soft)]">Cargando curso...</p>
        </article>
      </main>
    );
  }

  if (!course || error) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Curso no disponible</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{error || 'No encontramos este curso.'}</p>
          <Link
            href="/cursos"
            className="mt-4 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white"
          >
            Volver a cursos
          </Link>
        </article>
      </main>
    );
  }

  return (
    <main className="shell space-y-6 pb-16">
      <header className="relative overflow-hidden rounded-[2.5rem] border border-[var(--stroke)] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-soft)]">Curso</p>
            <h1 className="mt-3 text-4xl font-black text-[var(--ink)] display-type">{course.title}</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              {course.longDescription || course.shortDescription || 'Descripcion pendiente.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/cursos"
                className="rounded-full border border-[var(--stroke)] bg-white px-5 py-2 text-sm font-semibold text-[var(--ink)]"
              >
                Volver a cursos
              </Link>
              {locked ? (
                purchaseExternal ? (
                  <a
                    href={purchaseHref}
                    className="rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-white"
                    rel="noopener noreferrer"
                  >
                    Comprar curso
                  </a>
                ) : (
                  <Link
                    href={authStatus === 'guest' ? '/login' : purchaseHref}
                    className="rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-white"
                  >
                    {authStatus === 'guest' ? 'Iniciar sesion' : 'Desbloquear acceso'}
                  </Link>
                )
              ) : null}
            </div>
          </div>
          <div className="border-t border-[var(--stroke)] bg-[linear-gradient(160deg,#f8fafc,white)] p-6 sm:p-8 lg:border-l lg:border-t-0">
            {course.coverImage ? (
              <div className="relative mb-4 h-40 overflow-hidden rounded-2xl border border-[var(--stroke)]">
                <Image
                  src={course.coverImage}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 35vw, 100vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : null}
            <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Acceso</p>
              <p className={`mt-2 text-2xl font-black ${locked ? 'text-rose-600' : 'text-emerald-600'}`}>
                {locked ? 'Bloqueado' : 'Disponible'}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {locked
                  ? authStatus === 'guest'
                    ? 'Inicia sesion o compra el curso para desbloquearlo.'
                    : 'Necesitas compra, plan o acceso activo.'
                  : 'Puedes avanzar modulo a modulo.'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Indice del curso</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Modulos y lecciones ordenadas para avanzar sin perder contexto.
          </p>
          <div className="mt-4 space-y-3">
            {modules.map((module, index) => (
              <details key={module.id} className="group rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                      Modulo {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-[var(--ink)]">{module.title}</h3>
                    {module.description ? (
                      <p className="mt-1 text-xs text-[var(--ink-soft)]">{module.description}</p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                    {module.lessons?.length || 0} lecciones
                  </span>
                </summary>
                <div className="mt-3 space-y-2">
                  {(module.lessons || []).map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/cursos/${course.slug}/${lesson.slug}`}
                      className={`flex items-center justify-between rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm transition ${
                        locked ? 'pointer-events-none opacity-60' : 'hover:bg-white'
                      }`}
                      aria-disabled={locked}
                    >
                      <span className="font-semibold text-[var(--ink)]">{lesson.title}</span>
                      <span className="text-xs text-[var(--ink-soft)]">
                        {locked ? 'Bloqueada' : lesson.durationMinutes ? `${lesson.durationMinutes} min` : 'Leccion'}
                      </span>
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-[var(--stroke)] bg-[linear-gradient(135deg,#eef2ff,white)] p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Progreso</p>
            <h3 className="mt-2 text-2xl font-black text-[var(--ink)] display-type">{progressPercent}% completado</h3>
            <div className="mt-3 h-2 w-full rounded-full bg-white">
              <div
                className="h-2 rounded-full bg-[var(--green-500)] transition-all"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              {progress ? `${progress.completedLessons} de ${progress.totalLessons} lecciones completadas.` : 'Sin progreso registrado.'}
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Recursos</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Encontraras archivos adjuntos, plantillas y enlaces dentro de cada leccion.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
