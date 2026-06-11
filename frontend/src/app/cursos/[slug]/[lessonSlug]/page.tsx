'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { JSX as ReactJSX, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { CourseBlockRenderer } from '@/components/course-block-renderer';
import { api } from '@/lib/api';
import type { Course, CourseLesson, CourseModule } from '@/types';

type LessonPayload = {
  course: Course;
  lesson: CourseLesson;
  access: { canAccess: boolean; reason: string };
};

type RichNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<Record<string, unknown>>;
  content?: RichNode[];
};

function renderNodes(nodes?: RichNode[]) {
  if (!nodes || nodes.length === 0) return null;

  return nodes.map((node, index) => {
    const key = `${node.type || 'node'}-${index}`;
    const content = renderNodes(node.content || []);
    const inline = renderInline(node.content || []);

    if (node.type === 'paragraph') {
      return <p key={key} className="text-sm leading-7 text-[var(--ink-soft)]">{inline}</p>;
    }

    if (node.type === 'heading') {
      const level = Math.min(Math.max(Number(node.attrs?.level || 2), 2), 4);
      const Tag = `h${level}` as keyof ReactJSX.IntrinsicElements;
      return (
        <Tag key={key} className="mt-6 text-xl font-bold text-[var(--ink)]">
          {inline}
        </Tag>
      );
    }

    if (node.type === 'bullet_list' || node.type === 'bulletList') {
      return (
        <ul key={key} className="list-disc space-y-2 pl-5 text-sm text-[var(--ink-soft)]">
          {content}
        </ul>
      );
    }

    if (node.type === 'ordered_list' || node.type === 'orderedList') {
      return (
        <ol key={key} className="list-decimal space-y-2 pl-5 text-sm text-[var(--ink-soft)]">
          {content}
        </ol>
      );
    }

    if (node.type === 'list_item' || node.type === 'listItem') {
      return <li key={key}>{content}</li>;
    }

    if (node.type === 'blockquote' || node.type === 'callout') {
      return (
        <blockquote key={key} className="rounded-2xl border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.08)] p-4 text-sm text-[var(--ink)]">
          {content}
        </blockquote>
      );
    }

    if (node.type === 'image') {
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '';
      if (!src) return null;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={key} src={src} alt={alt} className="my-5 w-full rounded-3xl border border-[var(--stroke)] object-cover shadow-card" />
      );
    }

    if (node.type === 'youtube') {
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
      if (!src) return null;
      return (
        <iframe
          key={key}
          src={src}
          title="Video de la lección"
          className="my-5 aspect-video w-full rounded-3xl border border-[var(--stroke)] shadow-card"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (node.type === 'horizontalRule') {
      return <hr key={key} className="my-6 border-[var(--stroke)]" />;
    }

    if (node.type === 'table') {
      return (
        <div key={key} className="my-5 overflow-x-auto rounded-2xl border border-[var(--stroke)] bg-white">
          <table className="w-full min-w-[520px] text-sm">{content}</table>
        </div>
      );
    }

    if (node.type === 'tableRow') {
      return <tr key={key} className="border-b border-[var(--stroke)] last:border-b-0">{content}</tr>;
    }

    if (node.type === 'tableHeader') {
      return <th key={key} className="bg-[var(--bg-app)] px-3 py-2 text-left font-bold text-[var(--ink)]">{content}</th>;
    }

    if (node.type === 'tableCell') {
      return <td key={key} className="px-3 py-2 text-[var(--ink-soft)]">{content}</td>;
    }

    if (node.type === 'taskList') {
      return (
        <ul key={key} className="space-y-2">
          {content}
        </ul>
      );
    }

    if (node.type === 'taskItem') {
      const checked = Boolean(node.attrs?.checked);
      return (
        <li key={key} className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
          <span className={`h-4 w-4 rounded border ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--stroke)]'}`} />
          <span>{content}</span>
        </li>
      );
    }

    return <div key={key}>{content}</div>;
  });
}

function renderInline(nodes?: RichNode[]) {
  if (!nodes || nodes.length === 0) return null;

  return nodes.map((node, index) => {
    if (node.type === 'text') {
      return applyMarks(node.text ?? '', node.marks ?? [], index);
    }
    if (node.type === 'hard_break' || node.type === 'hardBreak') {
      return <br key={`br-${index}`} />;
    }
    return <span key={`inline-${index}`}>{renderNodes([node])}</span>;
  });
}

function applyMarks(text: string, marks: Array<Record<string, unknown>>, index: number) {
  if (!marks || marks.length === 0) {
    return <span key={`text-${index}`}>{text}</span>;
  }

  return marks.reduce<ReactNode>((acc, mark, markIndex) => {
    if (mark.type === 'bold') {
      return <strong key={`${mark.type}-${index}-${markIndex}`}>{acc}</strong>;
    }
    if (mark.type === 'italic') {
      return <em key={`${mark.type}-${index}-${markIndex}`}>{acc}</em>;
    }
    if (mark.type === 'strike') {
      return <s key={`${mark.type}-${index}-${markIndex}`}>{acc}</s>;
    }
    if (mark.type === 'link') {
      const attrs = mark.attrs && typeof mark.attrs === 'object'
        ? (mark.attrs as { href?: unknown })
        : {};
      const href = typeof attrs.href === 'string' ? attrs.href : '#';
      return (
        <a
          key={`${mark.type}-${index}-${markIndex}`}
          href={href}
          className="text-[var(--green-700)] underline"
          rel="noopener noreferrer"
          target={href.startsWith('http') ? '_blank' : undefined}
        >
          {acc}
        </a>
      );
    }
    return acc;
  }, <span key={`text-${index}`}>{text}</span>);
}

export default function LessonPage() {
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
        setError(err instanceof Error ? err.message : 'No se pudo cargar la leccion');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [slug, lessonSlug]);

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
                Esta leccion esta bloqueada. Necesitas acceso activo para continuar.
                <Link href="/services" className="ml-2 font-semibold underline">
                  Ver planes
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
                href={`/cursos/${payload.course.slug}`}
                className="mt-4 inline-flex rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-white"
              >
                Ver opciones de acceso
              </Link>
            </article>
          ) : (
            <article className="mt-6">
              <div className="prose max-w-none">
                {lesson?.blocks?.length ? (
                  <CourseBlockRenderer blocks={lesson.blocks} />
                ) : lesson?.contentJson ? (
                  renderNodes((lesson.contentJson as { content?: RichNode[] }).content)
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
