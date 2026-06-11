'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { api } from '@/lib/api';
import { CourseLessonEditor } from '@/components/course-lesson-editor';
import type {
  Course,
  CourseAccessType,
  CourseLesson,
  CourseModule,
  CourseModuleVisibility,
  CourseResource,
  CourseStatus,
  LessonStatus,
  LessonType,
  UserProfile,
} from '@/types';

const emptyModule: Partial<CourseModule> = {
  title: '',
  description: '',
  order: 0,
  visibility: 'visible',
};

const emptyLesson: Partial<CourseLesson> = {
  title: '',
  slug: '',
  contentJson: null,
  order: 0,
  durationMinutes: 10,
  status: 'draft',
  type: 'text',
};

const visibilityOptions: CourseModuleVisibility[] = ['visible', 'hidden'];
const lessonStatusOptions: LessonStatus[] = ['draft', 'published'];
const lessonTypeOptions: LessonType[] = ['text', 'video', 'downloadable', 'faq'];
const courseStatusOptions: CourseStatus[] = ['draft', 'published', 'archived'];
const courseAccessOptions: CourseAccessType[] = ['free', 'paid', 'pro', 'seguimiento'];

type PageProps = {
  params: { courseId: string };
};

export default function AdminCourseModulesPage({ params }: PageProps) {
  const routeParams = useParams<{ courseId?: string }>();
  const courseId = typeof routeParams.courseId === 'string' ? routeParams.courseId : params.courseId;
  const [me, setMe] = useState<UserProfile | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [moduleDrafts, setModuleDrafts] = useState<Record<string, Partial<CourseModule>>>({});
  const [lessonDrafts, setLessonDrafts] = useState<Record<string, Partial<CourseLesson>>>({});
  const [courseDraft, setCourseDraft] = useState<Partial<Course>>({});
  const [newModule, setNewModule] = useState<Partial<CourseModule>>(emptyModule);
  const [newLessons, setNewLessons] = useState<Record<string, Partial<CourseLesson>>>({});
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
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
        const selected = courses.find((item) => item.id === courseId || item.slug === courseId) || null;
        setCourse(selected);
        setCourseDraft(
          selected
            ? {
                title: selected.title,
                slug: selected.slug,
                shortDescription: selected.shortDescription || '',
                longDescription: selected.longDescription || '',
                price: selected.price || '',
                currency: selected.currency || 'EUR',
                stripePaymentLink: selected.stripePaymentLink || '',
                status: selected.status,
                accessType: selected.accessType,
                order: selected.order,
              }
            : {},
        );
        setModules(selected?.modules || []);
        setModuleDrafts(
          Object.fromEntries(
            (selected?.modules || []).map((module) => [
              module.id,
              {
                title: module.title,
                description: module.description || '',
                order: module.order,
                visibility: module.visibility,
              },
            ]),
          ),
        );
        setLessonDrafts(
          Object.fromEntries(
            (selected?.modules || [])
              .flatMap((module) => module.lessons || [])
              .map((lesson) => [
                lesson.id,
                {
                  title: lesson.title,
                  slug: lesson.slug,
                  contentJson: lesson.contentJson || null,
                  order: lesson.order,
                  durationMinutes: lesson.durationMinutes || 10,
                  status: lesson.status,
                  type: lesson.type,
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
  }, [courseId]);

  const visibleModules = useMemo(() => {
    return [...modules].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  }, [modules]);
  const publicationChecklist = useMemo(() => {
    const lessons = modules.flatMap((module) => module.lessons || []);
    return [
      { label: 'Título y slug', done: Boolean(courseDraft.title && courseDraft.slug) },
      { label: 'Portada pública', done: Boolean(course?.coverImage) },
      { label: 'Descripción corta', done: Boolean(courseDraft.shortDescription) },
      { label: 'Módulo visible', done: modules.some((module) => module.visibility === 'visible') },
      { label: 'Lección publicada', done: lessons.some((lesson) => lesson.status === 'published') },
      { label: 'Recursos S3 cargados', done: lessons.some((lesson) => (lesson.resources || []).length > 0) },
      { label: 'Acceso y precio coherentes', done: courseDraft.accessType !== 'paid' || Boolean(courseDraft.price && courseDraft.stripePaymentLink) },
    ];
  }, [course?.coverImage, courseDraft.accessType, courseDraft.price, courseDraft.shortDescription, courseDraft.slug, courseDraft.stripePaymentLink, courseDraft.title, modules]);

  async function saveCourseSettings() {
    if (!course) return;
    setSavingId('course-settings');
    setError('');
    try {
      const updated = await api.updateBackofficeCourse(course.id, {
        title: courseDraft.title,
        slug: courseDraft.slug,
        shortDescription: courseDraft.shortDescription,
        longDescription: courseDraft.longDescription,
        price: courseDraft.price ? String(courseDraft.price) : undefined,
        currency: courseDraft.currency,
        stripePaymentLink: courseDraft.stripePaymentLink,
        status: courseDraft.status,
        accessType: courseDraft.accessType,
        order: courseDraft.order,
      });
      setCourse((prev) => ({ ...(prev || updated), ...updated }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la configuración del curso');
    } finally {
      setSavingId('');
    }
  }

  async function createModule() {
    if (!newModule.title || !course) {
      setError('Titulo y curso son obligatorios.');
      return;
    }
    setSavingId('new-module');
    setError('');
    try {
      const created = await api.createBackofficeCourseModule(course.id, {
        title: newModule.title,
        description: newModule.description || undefined,
        order: newModule.order ?? 0,
        visibility: (newModule.visibility as CourseModuleVisibility) || 'visible',
      });
      setModules((prev) => [created, ...prev]);
      setModuleDrafts((prev) => ({
        ...prev,
        [created.id]: {
          title: created.title,
          description: created.description || '',
          order: created.order,
          visibility: created.visibility,
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
    const payload = moduleDrafts[moduleId];
    if (!payload) return;
    setSavingId(moduleId);
    setError('');
    try {
      const updated = await api.updateBackofficeCourseModule(moduleId, payload);
      setModules((prev) => prev.map((item) => (item.id === moduleId ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el modulo');
    } finally {
      setSavingId('');
    }
  }

  async function deleteModule(moduleId: string) {
    if (!window.confirm('Vas a borrar este modulo y sus lecciones. ¿Quieres continuar?')) {
      return;
    }
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

  async function createLesson(moduleId: string) {
    const payload = newLessons[moduleId];
    if (!payload?.title || !payload.slug) {
      setError('Titulo y slug son obligatorios para la leccion.');
      return;
    }
    setSavingId(`lesson-${moduleId}`);
    setError('');
    try {
      const created = await api.createBackofficeCourseLesson(moduleId, {
        title: payload.title,
        slug: payload.slug,
        contentJson: payload.contentJson || undefined,
        order: payload.order ?? 0,
        durationMinutes: payload.durationMinutes || 10,
        status: (payload.status as LessonStatus) || 'draft',
        type: (payload.type as LessonType) || 'text',
      });
      setModules((prev) =>
        prev.map((item) =>
          item.id === moduleId
            ? { ...item, lessons: [...(item.lessons || []), created] }
            : item,
        ),
      );
      setLessonDrafts((prev) => ({
        ...prev,
        [created.id]: {
          title: created.title,
          slug: created.slug,
          contentJson: created.contentJson || null,
          order: created.order,
          durationMinutes: created.durationMinutes || 10,
          status: created.status,
          type: created.type,
        },
      }));
      setNewLessons((prev) => ({ ...prev, [moduleId]: emptyLesson }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la leccion');
    } finally {
      setSavingId('');
    }
  }

  async function saveLesson(lessonId: string) {
    const payload = lessonDrafts[lessonId];
    if (!payload) return;
    setSavingId(lessonId);
    setError('');
    try {
      const updated = await api.updateBackofficeCourseLesson(lessonId, payload);
      setModules((prev) =>
        prev.map((module) => ({
          ...module,
          lessons: (module.lessons || []).map((item) => (item.id === lessonId ? updated : item)),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la leccion');
    } finally {
      setSavingId('');
    }
  }

  async function deleteLesson(lessonId: string) {
    if (!window.confirm('Vas a borrar esta leccion. ¿Quieres continuar?')) {
      return;
    }
    setSavingId(lessonId);
    setError('');
    try {
      await api.deleteBackofficeCourseLesson(lessonId);
      setModules((prev) =>
        prev.map((module) => ({
          ...module,
          lessons: (module.lessons || []).filter((lesson) => lesson.id !== lessonId),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo borrar la leccion');
    } finally {
      setSavingId('');
    }
  }

  async function uploadResource(lessonId: string, file: File, kind: 'image' | 'video' | 'file'): Promise<CourseResource | null> {
    setSavingId(`${lessonId}-resource`);
    setError('');
    try {
      const resource = await api.uploadBackofficeCourseResource(lessonId, kind, file);
      setModules((prev) =>
        prev.map((module) => ({
          ...module,
          lessons: (module.lessons || []).map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, resources: [...(lesson.resources || []), resource] }
              : lesson,
          ),
        })),
      );
      return resource;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el recurso');
      return null;
    } finally {
      setSavingId('');
    }
  }

  async function uploadCourseCover(file: File) {
    if (!course) return;
    setSavingId('course-cover');
    setError('');
    try {
      const updated = await api.uploadBackofficeCourseCover(course.id, file);
      setCourse(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la portada');
    } finally {
      setSavingId('');
    }
  }

  async function deleteResource(resourceId: string) {
    const accepted = window.confirm('Se eliminara el recurso tambien de S3. ¿Continuar?');
    if (!accepted) return;
    setSavingId(resourceId);
    setError('');
    try {
      await api.deleteBackofficeCourseResource(resourceId);
      setModules((prev) =>
        prev.map((module) => ({
          ...module,
          lessons: (module.lessons || []).map((lesson) => ({
            ...lesson,
            resources: (lesson.resources || []).filter((resource) => resource.id !== resourceId),
          })),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo borrar el recurso');
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
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-4">
      <header className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--green-700)]">Constructor de curso</p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--ink)]">Contenido del curso</h1>
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
          {course ? (
            <Link
              href={`/cursos/${course.slug}`}
              className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white"
            >
              Previsualizar curso
            </Link>
          ) : null}
        </div>
        {course ? (
          <div className="mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Portada pública del curso</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              {course.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.coverImage} alt="" className="h-20 w-32 rounded-xl object-cover" />
              ) : (
                <div className="flex h-20 w-32 items-center justify-center rounded-xl border border-dashed border-[var(--stroke)] bg-white text-xs text-[var(--ink-soft)]">
                  Sin portada
                </div>
              )}
              <label className="w-fit rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm">
                {savingId === 'course-cover' ? 'Subiendo...' : 'Subir portada'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void uploadCourseCover(file);
                    event.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
          </div>
        ) : null}
      </header>

      {course ? (
        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Configuración editorial</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">Portada, acceso, estado, precio y descripción pública del curso.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-[var(--ink)]">Título<input className="ds-control mt-1" value={courseDraft.title || ''} onChange={(e) => setCourseDraft((prev) => ({ ...prev, title: e.target.value }))} /></label>
              <label className="text-sm font-semibold text-[var(--ink)]">Slug<input className="ds-control mt-1" value={courseDraft.slug || ''} onChange={(e) => setCourseDraft((prev) => ({ ...prev, slug: e.target.value }))} /></label>
              <label className="text-sm font-semibold text-[var(--ink)]">Estado<select className="ds-control mt-1" value={courseDraft.status || 'draft'} onChange={(e) => setCourseDraft((prev) => ({ ...prev, status: e.target.value as CourseStatus }))}>{courseStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
              <label className="text-sm font-semibold text-[var(--ink)]">Acceso<select className="ds-control mt-1" value={courseDraft.accessType || 'free'} onChange={(e) => setCourseDraft((prev) => ({ ...prev, accessType: e.target.value as CourseAccessType }))}>{courseAccessOptions.map((access) => <option key={access} value={access}>{access}</option>)}</select></label>
              <label className="text-sm font-semibold text-[var(--ink)]">Precio<input className="ds-control mt-1" value={courseDraft.price || ''} onChange={(e) => setCourseDraft((prev) => ({ ...prev, price: e.target.value }))} /></label>
              <label className="text-sm font-semibold text-[var(--ink)]">Moneda<input className="ds-control mt-1" value={courseDraft.currency || 'EUR'} onChange={(e) => setCourseDraft((prev) => ({ ...prev, currency: e.target.value }))} /></label>
              <label className="text-sm font-semibold text-[var(--ink)] md:col-span-2">Stripe Payment Link<input className="ds-control mt-1" value={courseDraft.stripePaymentLink || ''} onChange={(e) => setCourseDraft((prev) => ({ ...prev, stripePaymentLink: e.target.value }))} /></label>
              <label className="text-sm font-semibold text-[var(--ink)] md:col-span-2">Descripción corta<textarea className="ds-control mt-1 min-h-24" value={courseDraft.shortDescription || ''} onChange={(e) => setCourseDraft((prev) => ({ ...prev, shortDescription: e.target.value }))} /></label>
              <label className="text-sm font-semibold text-[var(--ink)] md:col-span-2">Descripción larga<textarea className="ds-control mt-1 min-h-28" value={courseDraft.longDescription || ''} onChange={(e) => setCourseDraft((prev) => ({ ...prev, longDescription: e.target.value }))} /></label>
            </div>
            <button type="button" onClick={() => void saveCourseSettings()} disabled={savingId === 'course-settings'} className="mt-4 rounded-xl bg-[var(--green-500)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{savingId === 'course-settings' ? 'Guardando...' : 'Guardar configuración'}</button>
          </article>
          <article className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Checklist de publicación</h2>
            <div className="mt-4 space-y-2">
              {publicationChecklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3 text-sm">
                  <span className={`h-3 w-3 rounded-full ${item.done ? 'bg-[var(--green-500)]' : 'bg-amber-400'}`} />
                  <span className="font-semibold text-[var(--ink)]">{item.label}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {error ? (
        <article className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </article>
      ) : null}

      <section className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Nuevo modulo</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            value={newModule.title || ''}
            onChange={(e) => setNewModule((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Titulo"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          />
          <input
            value={newModule.description || ''}
            onChange={(e) => setNewModule((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Descripcion"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          />
          <label className="text-sm text-[var(--ink)]">
            Orden
            <input
              type="number"
              value={newModule.order ?? 0}
              onChange={(e) => setNewModule((prev) => ({ ...prev, order: Number(e.target.value) }))}
              className="ml-2 w-20 rounded-xl border border-[var(--stroke)] px-2 py-1 text-sm"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-sm text-[var(--ink)]">
            Visibilidad
            <select
              value={newModule.visibility || 'visible'}
              onChange={(e) => setNewModule((prev) => ({ ...prev, visibility: e.target.value as CourseModuleVisibility }))}
              className="ml-2 rounded-xl border border-[var(--stroke)] px-2 py-1 text-sm"
            >
              {visibilityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void createModule()}
            disabled={savingId === 'new-module'}
            className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)] disabled:opacity-60"
          >
            {savingId === 'new-module' ? 'Creando...' : 'Crear modulo'}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {visibleModules.map((module) => {
          const moduleDraft = moduleDrafts[module.id] || {};
          const lessons = module.lessons || [];
          const isExpanded = expandedModuleId === module.id;
          return (
            <article key={module.id} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--ink)]">{moduleDraft.title || module.title}</p>
                    <span className="rounded-full bg-[var(--bg-app)] px-2 py-1 text-[11px] font-semibold text-[var(--ink-soft)]">
                      Orden {moduleDraft.order ?? module.order}
                    </span>
                    <span className="rounded-full bg-[var(--bg-app)] px-2 py-1 text-[11px] font-semibold text-[var(--ink-soft)]">
                      {lessons.length} lecciones
                    </span>
                  </div>
                  {moduleDraft.description ? (
                    <p className="mt-2 text-xs text-[var(--ink-soft)]">{moduleDraft.description}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedModuleId(isExpanded ? null : module.id)}
                    className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
                  >
                    {isExpanded ? 'Cerrar' : 'Editar modulo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveModule(module.id)}
                    disabled={savingId === module.id}
                    className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {savingId === module.id ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteModule(module.id)}
                    disabled={savingId === module.id}
                    className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 disabled:opacity-60"
                  >
                    Borrar
                  </button>
                </div>
              </div>

              {isExpanded ? (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-[var(--ink)]">
                      Titulo
                      <input
                        value={moduleDraft.title || ''}
                        onChange={(e) =>
                          setModuleDrafts((prev) => ({
                            ...prev,
                            [module.id]: { ...moduleDraft, title: e.target.value },
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm text-[var(--ink)]">
                      Descripcion
                      <input
                        value={moduleDraft.description || ''}
                        onChange={(e) =>
                          setModuleDrafts((prev) => ({
                            ...prev,
                            [module.id]: { ...moduleDraft, description: e.target.value },
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm text-[var(--ink)]">
                      Orden
                      <input
                        type="number"
                        value={moduleDraft.order ?? 0}
                        onChange={(e) =>
                          setModuleDrafts((prev) => ({
                            ...prev,
                            [module.id]: { ...moduleDraft, order: Number(e.target.value) },
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm text-[var(--ink)]">
                      Visibilidad
                      <select
                        value={moduleDraft.visibility || 'visible'}
                        onChange={(e) =>
                          setModuleDrafts((prev) => ({
                            ...prev,
                            [module.id]: { ...moduleDraft, visibility: e.target.value as CourseModuleVisibility },
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                      >
                        {visibilityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
                    <h3 className="text-sm font-semibold text-[var(--ink)]">Lecciones</h3>
                    <div className="mt-3 grid gap-3">
                      {lessons.map((lesson) => {
                        const lessonDraft = lessonDrafts[lesson.id] || {};
                        const isLessonExpanded = expandedLessonId === lesson.id;
                        return (
                          <div key={lesson.id} className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-[var(--ink)]">{lessonDraft.title || lesson.title}</p>
                                <p className="text-xs text-[var(--ink-soft)]">{lessonDraft.slug || lesson.slug}</p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedLessonId(isLessonExpanded ? null : lesson.id)}
                                  className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ink)]"
                                >
                                  {isLessonExpanded ? 'Cerrar' : 'Editar'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void saveLesson(lesson.id)}
                                  disabled={savingId === lesson.id}
                                  className="rounded-xl bg-[var(--green-500)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                                >
                                  {savingId === lesson.id ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void deleteLesson(lesson.id)}
                                  disabled={savingId === lesson.id}
                                  className="rounded-xl border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600 disabled:opacity-60"
                                >
                                  Borrar
                                </button>
                              </div>
                            </div>

                            {isLessonExpanded ? (
                              <div className="mt-4 space-y-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                  <label className="text-sm text-[var(--ink)]">
                                    Titulo
                                    <input
                                      value={lessonDraft.title || ''}
                                      onChange={(e) =>
                                        setLessonDrafts((prev) => ({
                                          ...prev,
                                          [lesson.id]: { ...lessonDraft, title: e.target.value },
                                        }))
                                      }
                                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                                    />
                                  </label>
                                  <label className="text-sm text-[var(--ink)]">
                                    Slug
                                    <input
                                      value={lessonDraft.slug || ''}
                                      onChange={(e) =>
                                        setLessonDrafts((prev) => ({
                                          ...prev,
                                          [lesson.id]: { ...lessonDraft, slug: e.target.value },
                                        }))
                                      }
                                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                                    />
                                  </label>
                                  <label className="text-sm text-[var(--ink)]">
                                    Estado
                                    <select
                                      value={lessonDraft.status || 'draft'}
                                      onChange={(e) =>
                                        setLessonDrafts((prev) => ({
                                          ...prev,
                                          [lesson.id]: { ...lessonDraft, status: e.target.value as LessonStatus },
                                        }))
                                      }
                                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                                    >
                                      {lessonStatusOptions.map((status) => (
                                        <option key={status} value={status}>
                                          {status}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                  <label className="text-sm text-[var(--ink)]">
                                    Tipo
                                    <select
                                      value={lessonDraft.type || 'text'}
                                      onChange={(e) =>
                                        setLessonDrafts((prev) => ({
                                          ...prev,
                                          [lesson.id]: { ...lessonDraft, type: e.target.value as LessonType },
                                        }))
                                      }
                                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                                    >
                                      {lessonTypeOptions.map((type) => (
                                        <option key={type} value={type}>
                                          {type}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                  <label className="text-sm text-[var(--ink)]">
                                    Orden
                                    <input
                                      type="number"
                                      value={lessonDraft.order ?? 0}
                                      onChange={(e) =>
                                        setLessonDrafts((prev) => ({
                                          ...prev,
                                          [lesson.id]: { ...lessonDraft, order: Number(e.target.value) },
                                        }))
                                      }
                                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                                    />
                                  </label>
                                  <label className="text-sm text-[var(--ink)]">
                                    Duracion (min)
                                    <input
                                      type="number"
                                      value={lessonDraft.durationMinutes ?? 10}
                                      onChange={(e) =>
                                        setLessonDrafts((prev) => ({
                                          ...prev,
                                          [lesson.id]: { ...lessonDraft, durationMinutes: Number(e.target.value) },
                                        }))
                                      }
                                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                                    />
                                  </label>
                                </div>

                                <CourseLessonEditor
                                  value={(lessonDraft.contentJson as Record<string, unknown>) || null}
                                  resources={lesson.resources || []}
                                  onUploadResource={(file, kind) => uploadResource(lesson.id, file, kind)}
                                  onChange={(next) =>
                                    setLessonDrafts((prev) => ({
                                      ...prev,
                                      [lesson.id]: { ...lessonDraft, contentJson: next },
                                    }))
                                  }
                                />

                                <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Biblioteca S3 de la lección</p>
                                  <p className="mt-1 text-xs text-[var(--ink-soft)]">Sube imágenes, vídeos, PDFs o documentos. Se guardan como recursos privados y se entregan con URL firmada cuando el alumno tiene acceso.</p>
                                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                    {['image', 'video', 'file'].map((kind) => (
                                      <label key={kind} className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ink)]">
                                        {`Subir ${kind}`}
                                        <input
                                          type="file"
                                          accept={
                                            kind === 'image'
                                              ? 'image/jpeg,image/png,image/webp'
                                              : kind === 'video'
                                                ? 'video/mp4,video/quicktime'
                                                : '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                          }
                                          className="hidden"
                                          onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (!file) return;
                                            void uploadResource(lesson.id, file, kind as 'image' | 'video' | 'file');
                                            event.currentTarget.value = '';
                                          }}
                                        />
                                      </label>
                                    ))}
                                  </div>
                                  {lesson.resources && lesson.resources.length > 0 ? (
                                    <ul className="mt-3 space-y-2 text-xs text-[var(--ink-soft)]">
                                      {lesson.resources.map((resource) => (
                                        <li key={resource.id} className="flex flex-col gap-2 rounded-xl border border-[var(--stroke)] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                                          <span>{resource.originalName || resource.publicUrl}</span>
                                          <span className="rounded-full bg-[var(--bg-app)] px-2 py-1 font-semibold">{resource.kind} · {resource.fileType}</span>
                                          <button
                                            type="button"
                                            onClick={() => void deleteResource(resource.id)}
                                            disabled={savingId === resource.id}
                                            className="rounded-lg border border-red-100 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                                          >
                                            Eliminar
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="mt-3 text-xs text-[var(--ink-soft)]">Sin recursos cargados.</p>
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 rounded-2xl border border-[var(--stroke)] bg-white p-4">
                      <h4 className="text-sm font-semibold text-[var(--ink)]">Nueva leccion</h4>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <input
                          value={newLessons[module.id]?.title || ''}
                          onChange={(e) =>
                            setNewLessons((prev) => ({
                              ...prev,
                              [module.id]: { ...prev[module.id], title: e.target.value },
                            }))
                          }
                          placeholder="Titulo"
                          className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                        />
                        <input
                          value={newLessons[module.id]?.slug || ''}
                          onChange={(e) =>
                            setNewLessons((prev) => ({
                              ...prev,
                              [module.id]: { ...prev[module.id], slug: e.target.value },
                            }))
                          }
                          placeholder="slug-leccion"
                          className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label className="text-sm text-[var(--ink)]">
                          Tipo
                          <select
                            value={newLessons[module.id]?.type || 'text'}
                            onChange={(e) =>
                              setNewLessons((prev) => ({
                                ...prev,
                                [module.id]: { ...prev[module.id], type: e.target.value as LessonType },
                              }))
                            }
                            className="ml-2 rounded-xl border border-[var(--stroke)] px-2 py-1 text-sm"
                          >
                            {lessonTypeOptions.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm text-[var(--ink)]">
                          Estado
                          <select
                            value={newLessons[module.id]?.status || 'draft'}
                            onChange={(e) =>
                              setNewLessons((prev) => ({
                                ...prev,
                                [module.id]: { ...prev[module.id], status: e.target.value as LessonStatus },
                              }))
                            }
                            className="ml-2 rounded-xl border border-[var(--stroke)] px-2 py-1 text-sm"
                          >
                            {lessonStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm text-[var(--ink)]">
                          Orden
                          <input
                            type="number"
                            value={newLessons[module.id]?.order ?? 0}
                            onChange={(e) =>
                              setNewLessons((prev) => ({
                                ...prev,
                                [module.id]: { ...prev[module.id], order: Number(e.target.value) },
                              }))
                            }
                            className="ml-2 w-20 rounded-xl border border-[var(--stroke)] px-2 py-1 text-sm"
                          />
                        </label>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => void createLesson(module.id)}
                          disabled={savingId === `lesson-${module.id}`}
                          className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {savingId === `lesson-${module.id}` ? 'Creando...' : 'Crear leccion'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
        </div>
      </div>
    </main>
  );
}
