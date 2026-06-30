'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { CourseBlockRenderer } from '@/components/course-block-renderer';
import { CourseModuleIndex } from '@/components/course-module-index';
import { CourseTipTapRenderer } from '@/components/course-tiptap-renderer';
import { CollapsePanel } from '@/components/collapse-panel';
import { filterLessonResourcesForDisplay } from '@/lib/course-lesson-resources';
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
        const needsAuth =
          message.includes('401') ||
          message.includes('403') ||
          message.toLowerCase().includes('unauthorized') ||
          message.toLowerCase().includes('forbidden');
        if (needsAuth) {
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
  const displayResources = useMemo(
    () => filterLessonResourcesForDisplay(lesson?.resources, lesson?.contentJson),
    [lesson?.contentJson, lesson?.resources],
  );

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
      <main className="shell py-4">
        <article className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card md:rounded-3xl md:p-6">
          <p className="text-sm text-[var(--ink-soft)]">Cargando lección...</p>
        </article>
      </main>
    );
  }

  if (!payload || error) {
    return (
      <main className="shell py-4">
        <article className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card md:rounded-3xl md:p-6">
          <h1 className="text-xl font-bold text-[var(--ink)] md:text-2xl">Lección no disponible</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{error || 'No encontramos esta lección.'}</p>
          <Link
            href="/cursos"
            className="mt-4 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Volver a cursos
          </Link>
        </article>
      </main>
    );
  }

  return (
    <main className="shell lesson-page">
      <div className="mb-3 lg:hidden">
        <CollapsePanel
          title="Índice del curso"
          subtitle="Ver u ocultar módulos y lecciones"
          meta={`${lessonItems.length} lecc.`}
          className="shadow-card"
        >
          <CourseModuleIndex
            courseSlug={payload.course.slug}
            modules={modules}
            mode="nav"
            activeLessonSlug={lesson?.slug}
            defaultOpenFirst
          />
        </CollapsePanel>
      </div>

      <div className="grid gap-4 lg:h-full lg:grid-cols-[minmax(240px,280px)_1fr] lg:gap-6">
        <aside className="hidden h-full overflow-y-auto rounded-2xl border border-[var(--stroke)] bg-white p-3 shadow-card lg:block lg:rounded-3xl lg:p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Índice</p>
          <div className="mt-3">
            <CourseModuleIndex
              courseSlug={payload.course.slug}
              modules={modules}
              mode="nav"
              activeLessonSlug={lesson?.slug}
              defaultOpenFirst
            />
          </div>
        </aside>

        <section className="lesson-page__content flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--stroke)] bg-white shadow-card lg:rounded-3xl">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
            <header className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 md:p-5 lg:rounded-3xl lg:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)] md:text-xs">Lección</p>
              <h1 className="display-type mt-1 text-2xl font-black leading-tight text-[var(--ink)] sm:text-3xl lg:mt-2">{lesson?.title}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--ink-soft)] md:mt-3">
                <span>{lesson?.durationMinutes ? `${lesson.durationMinutes} min` : 'Tiempo flexible'}</span>
                <span>Tipo: {lesson?.type}</span>
              </div>
              {locked ? (
                <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 md:mt-4">
                  Esta lección está incluida en {proPlan.name}. Actívalo para continuar.
                  <Link href={proHref} className="ml-2 font-semibold underline">
                    {proPlan.ctaLabel}
                  </Link>
                </div>
              ) : null}
            </header>

            {locked ? (
              <article className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 md:mt-6 md:p-6 lg:rounded-3xl">
                <h2 className="text-lg font-black text-amber-950 md:text-xl">Contenido bloqueado</h2>
                <p className="mt-2 text-sm leading-6 text-amber-900 md:text-base">
                  Esta lección existe, pero el contenido solo se entrega cuando el acceso del usuario está activo.
                </p>
                <Link
                  href={proHref}
                  className="mt-4 inline-flex rounded-full bg-[var(--green-700)] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  {proPlan.ctaLabel}
                </Link>
              </article>
            ) : (
              <article className="mt-4 md:mt-6 lg:mx-auto lg:max-w-3xl">
                {lesson?.contentJson ? (
                  <CourseTipTapRenderer content={lesson.contentJson} />
                ) : lesson?.blocks?.length ? (
                  <CourseBlockRenderer blocks={lesson.blocks} />
                ) : (
                  <p className="text-base text-[var(--ink-soft)]">Contenido pendiente.</p>
                )}
                {displayResources.length ? (
                  <div className="mt-5 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 md:mt-6">
                    <h2 className="text-sm font-bold text-[var(--ink)] md:text-base">Descargas</h2>
                    <ul className="mt-3 space-y-2">
                      {displayResources.map((resource) => (
                        <li key={resource.id}>
                          <a
                            href={resource.publicUrl}
                            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--stroke)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:border-[rgba(22,112,85,0.22)]"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            <span className="min-w-0 truncate">{resource.originalName || resource.kind}</span>
                            <span className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-[var(--green-700)]">
                              Descargar
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            )}
          </div>

          <div className="lesson-page__footer flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/cursos/${payload.course.slug}`}
                className="flex-1 rounded-full border border-[var(--stroke)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[var(--ink)] sm:flex-none sm:px-5"
              >
                Volver al curso
              </Link>
              {previousLesson ? (
                <Link
                  href={`/cursos/${payload.course.slug}/${previousLesson.slug}`}
                  className="flex-1 rounded-full border border-[var(--stroke)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[var(--ink)] sm:flex-none sm:px-5"
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
                className="flex-1 rounded-full bg-[var(--green-500)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:flex-none sm:px-5"
              >
                {marking ? 'Guardando...' : 'Completada'}
              </button>
              {nextLesson ? (
                <Link
                  href={`/cursos/${payload.course.slug}/${nextLesson.slug}`}
                  className="flex-1 rounded-full bg-[var(--ink)] px-4 py-2.5 text-center text-sm font-semibold text-white sm:flex-none sm:px-5"
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
