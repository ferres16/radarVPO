'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { CourseBlockRenderer } from '@/components/course-block-renderer';
import { CourseTipTapRenderer } from '@/components/course-tiptap-renderer';
import { api } from '@/lib/api';
import { proHref, proPlan } from '@/lib/pro';
import type { Course, CourseLesson, CourseModule } from '@/types';

type LessonPayload = {
  course: Course;
  lesson: CourseLesson;
  access: { canAccess: boolean; reason: string };
};

export default function LessonPage() {
  const router = useRouter();
  const params = useParams<{ slug?: string; lessonSlug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const lessonSlug = typeof params.lessonSlug === 'string' ? params.lessonSlug : '';
  const [payload, setPayload] = useState<LessonPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await api.getCourseLesson(slug, lessonSlug);
        if (!active) return;
        setPayload(data);
        setError('');
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : 'No se pudo cargar la leccion';
        if (message.includes('401') || message.toLowerCase().includes('unauthorized')) {
          const next = `/cursos/${slug}/${lessonSlug}`;
          router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [lessonSlug, router, slug]);

  const modules = useMemo<CourseModule[]>(() => payload?.course.modules || [], [payload]);
  const lesson = payload?.lesson;
  const locked = payload ? !payload.access.canAccess : true;
  const lessonItems = useMemo(
    () => modules.flatMap((module) => module.lessons || []),
    [modules],
  );
  const currentIndex = lessonItems.findIndex((item) => item.slug === lesson?.slug);
  const previousLesson = currentIndex > 0 ? lessonItems[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < lessonItems.length - 1 ? lessonItems[currentIndex + 1] : null;

  async function markCompleted() {
    if (!lesson) return;
    setMarking(true);
    try {
      await api.markLessonCompleted(slug, lesson.slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar progreso');
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <p className="text-sm text-[var(--ink-soft)]">Cargando leccion...</p>
        </article>
      </main>
    );
  }

  if (!payload || error) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Leccion no disponible</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{error || 'No encontramos esta leccion.'}</p>
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
    <main className="shell h-[calc(100vh-96px)] min-h-[640px] overflow-hidden pb-6">
      <div className="grid h-full gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="h-full overflow-y-auto rounded-3xl border border-[var(--stroke)] bg-white p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Indice</p>
        <div className="mt-3 space-y-3">
          {modules.map((module) => (
            <div key={module.id} className="space-y-2">
              <p className="text-xs font-semibold text-[var(--ink)]">{module.title}</p>
              <div className="space-y-1">
                {(module.lessons || []).map((item) => (
                  <Link
                    key={item.id}
                    href={`/cursos/${payload.course.slug}/${item.slug}`}
                    className={`block rounded-xl px-3 py-2 text-xs font-semibold ${
                      item.slug === lesson?.slug
                        ? 'bg-[var(--green-500)] text-white'
                        : 'border border-[var(--stroke)] text-[var(--ink)]'
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-[var(--stroke)] bg-white shadow-card">
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--bg-app)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Leccion</p>
            <h1 className="mt-2 text-3xl font-black text-[var(--ink)] display-type">{lesson?.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--ink-soft)]">
              <span>{lesson?.durationMinutes ? `${lesson.durationMinutes} min` : 'Tiempo flexible'}</span>
              <span>Tipo: {lesson?.type}</span>
            </div>
            {locked ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                Esta lección está incluida en {proPlan.name}. Actívalo para continuar.
                <Link href={proHref} className="ml-2 font-semibold underline">
                  {proPlan.ctaLabel}
                </Link>
              </div>
            ) : null}
          </header>

          {locked ? (
            <article className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-xl font-black text-amber-950">Contenido bloqueado</h2>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Esta leccion existe, pero el contenido solo se entrega cuando el acceso del usuario esta activo en la base de datos.
              </p>
              <Link
                href={proHref}
                className="mt-4 inline-flex rounded-full bg-[var(--green-700)] px-5 py-2 text-sm font-semibold text-white"
              >
                {proPlan.ctaLabel}
              </Link>
            </article>
          ) : (
            <article className="mx-auto mt-8 max-w-3xl">
              <div className="prose max-w-none">
                {lesson?.contentJson ? (
                  <CourseTipTapRenderer content={lesson.contentJson} />
                ) : lesson?.blocks?.length ? (
                  <CourseBlockRenderer blocks={lesson.blocks} />
                ) : (
                  <p className="text-sm text-[var(--ink-soft)]">Contenido pendiente.</p>
                )}
              </div>
              {lesson?.resources?.length ? (
                <div className="mt-6 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
                  <h2 className="text-sm font-bold text-[var(--ink)]">Recursos adjuntos</h2>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {lesson.resources.map((resource) => (
                      <div key={resource.id} className="rounded-xl border border-[var(--stroke)] bg-white p-3">
                        {resource.kind === 'image' && resource.publicUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resource.publicUrl} alt={resource.originalName || ''} className="mb-3 h-48 w-full rounded-xl object-cover" />
                        ) : null}
                        {resource.kind === 'video' && resource.publicUrl ? (
                          <video src={resource.publicUrl} controls className="mb-3 aspect-video w-full rounded-xl" />
                        ) : null}
                        <a
                          href={resource.publicUrl}
                          className="text-sm font-semibold text-[var(--ink)] underline"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {resource.originalName || resource.kind}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--stroke)] bg-white/95 p-4 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/cursos/${payload.course.slug}`}
              className="rounded-full border border-[var(--stroke)] bg-white px-5 py-2 text-sm font-semibold text-[var(--ink)]"
            >
              Volver al curso
            </Link>
            {previousLesson ? (
              <Link
                href={`/cursos/${payload.course.slug}/${previousLesson.slug}`}
                className="rounded-full border border-[var(--stroke)] bg-white px-5 py-2 text-sm font-semibold text-[var(--ink)]"
              >
                Anterior
              </Link>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void markCompleted()}
              disabled={locked || marking}
              className="rounded-full bg-[var(--green-500)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {marking ? 'Guardando...' : 'Marcar completada'}
            </button>
            {nextLesson ? (
              <Link
                href={`/cursos/${payload.course.slug}/${nextLesson.slug}`}
                className="rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-white"
              >
                Siguiente
              </Link>
            ) : null}
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
