'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { api } from '@/lib/api';
import type { Course, CourseAccessType, CourseStatus, UserProfile } from '@/types';

const emptyCourse: Partial<Course> = {
  title: '',
  slug: '',
  shortDescription: '',
  longDescription: '',
  coverImage: '',
  price: '',
  salePrice: '',
  currency: 'EUR',
  stripePaymentLink: '',
  status: 'draft',
  accessType: 'free',
  order: 0,
};

const statusOptions: CourseStatus[] = ['draft', 'published', 'archived'];
const accessOptions: CourseAccessType[] = ['free', 'paid', 'pro', 'seguimiento'];

const getCourseSalePrice = (course: Pick<Course, 'salePrice' | 'seoMetadata'>) => {
  const metadataSalePrice = course.seoMetadata?.salePrice;
  if (typeof metadataSalePrice === 'string' || typeof metadataSalePrice === 'number') {
    return String(metadataSalePrice);
  }
  return course.salePrice || '';
};

const withSaleMetadata = (payload: Partial<Course>): Partial<Course> => ({
  ...payload,
  seoMetadata: {
    ...(payload.seoMetadata || {}),
    salePrice: payload.salePrice ? String(payload.salePrice) : null,
  },
});

export default function AdminCoursesPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Partial<Course>>>({});
  const [newCourse, setNewCourse] = useState<Partial<Course>>(emptyCourse);
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
                shortDescription: course.shortDescription || '',
                longDescription: course.longDescription || '',
                coverImage: course.coverImage || '',
                status: course.status,
                accessType: course.accessType,
                order: course.order,
                price: course.price || '',
                salePrice: getCourseSalePrice(course),
                currency: course.currency || 'EUR',
                stripePaymentLink: course.stripePaymentLink || '',
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

  const visibleCourses = useMemo(() => {
    const term = query.trim().toLowerCase();
    return [...courses]
      .filter((course) => {
        if (!term) return true;
        return course.title.toLowerCase().includes(term) || course.slug.toLowerCase().includes(term);
      })
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  }, [courses, query]);

  async function saveCourse(courseId: string) {
    const payload = drafts[courseId];
    if (!payload) return;
    setSavingId(courseId);
    setError('');
    try {
      const updated = await api.updateBackofficeCourse(courseId, withSaleMetadata(payload));
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
        shortDescription: newCourse.shortDescription || undefined,
        longDescription: newCourse.longDescription || undefined,
        coverImage: newCourse.coverImage || undefined,
        status: (newCourse.status as CourseStatus) || 'draft',
        accessType: (newCourse.accessType as CourseAccessType) || 'free',
        order: newCourse.order ?? 0,
        price: newCourse.price ? String(newCourse.price) : undefined,
        seoMetadata: {
          ...(newCourse.seoMetadata || {}),
          salePrice: newCourse.salePrice ? String(newCourse.salePrice) : null,
        },
        currency: newCourse.currency || undefined,
        stripePaymentLink: newCourse.stripePaymentLink || undefined,
      });
      setCourses((prev) => [created, ...prev]);
      setDrafts((prev) => ({
        ...prev,
        [created.id]: {
          title: created.title,
          slug: created.slug,
          shortDescription: created.shortDescription || '',
          longDescription: created.longDescription || '',
          coverImage: created.coverImage || '',
          status: created.status,
          accessType: created.accessType,
          order: created.order,
          price: created.price || '',
          salePrice: getCourseSalePrice(created),
          currency: created.currency || 'EUR',
          stripePaymentLink: created.stripePaymentLink || '',
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
    if (!window.confirm('Vas a borrar el curso y su contenido asociado. ¿Quieres continuar?')) {
      return;
    }
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
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-4">
      <PageHero
        eyebrow="Cursos CMS"
        title="Editor de cursos preparado para contenido por bloques"
        description="Crea cursos, organiza módulos, gestiona acceso y prepara una experiencia editorial tipo Notion/Gutenberg con multimedia reutilizable."
        actions={
          <>
            <ButtonLink href="/admin/access">Compras y activaciones</ButtonLink>
            <ButtonLink href="/admin/services" variant="secondary">Acompañamiento</ButtonLink>
          </>
        }
      />

      <SurfaceCard className="p-5">
        <SectionHeader
          eyebrow="Editor visual"
          title="Bloques disponibles para cursos"
          description="Base visual para evolucionar el editor actual hacia bloques arrastrables con multimedia, citas, tablas y CTAs."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {['Texto enriquecido', 'Imagen / galería', 'Vídeo', 'PDF descargable', 'Cita destacada', 'Tabla', 'Botón CTA', 'Formulario'].map((block) => (
            <div key={block} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 text-sm font-semibold text-[var(--ink)]">
              {block}
            </div>
          ))}
        </div>
      </SurfaceCard>

      <header className="overflow-hidden rounded-3xl border border-[var(--stroke)] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-[var(--ink)]">Administrar cursos</h1>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Crea cursos, organiza el contenido y define acceso desde este panel.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/admin/access" className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">
                Compras y activaciones
              </Link>
              <Link href="/admin/services" className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">
                Acompañamiento
              </Link>
            </div>
          </div>
          <div className="border-t border-[var(--stroke)] bg-[var(--bg-app)] p-6 lg:border-l lg:border-t-0">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Cursos</p>
                <p className="mt-2 text-2xl font-black text-[var(--ink)]">{courses.length}</p>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Publicados</p>
                <p className="mt-2 text-2xl font-black text-[var(--ink)]">
                  {courses.filter((course) => course.status === 'published').length}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Modulos</p>
                <p className="mt-2 text-2xl font-black text-[var(--ink)]">
                  {courses.reduce((total, course) => total + (course.modules?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {error ? (
        <article className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </article>
      ) : null}

      <section className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
        <label className="text-sm font-semibold text-[var(--ink)]">
          Buscar cursos
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por titulo o slug"
            className="mt-2 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          />
        </label>
      </section>

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
            placeholder="slug-curso"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          />
          <input
            value={newCourse.price || ''}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, price: e.target.value }))}
            placeholder="Precio"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          />
          <input
            value={newCourse.salePrice || ''}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, salePrice: e.target.value }))}
            placeholder="Precio oferta"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          />
          <input
            value={newCourse.currency || ''}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, currency: e.target.value }))}
            placeholder="Moneda (EUR)"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          />
          <input
            value={newCourse.shortDescription || ''}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, shortDescription: e.target.value }))}
            placeholder="Descripcion corta"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm md:col-span-2"
          />
          <input
            value={newCourse.coverImage || ''}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, coverImage: e.target.value }))}
            placeholder="Cover image URL"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm md:col-span-2"
          />
          <input
            value={newCourse.stripePaymentLink || ''}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, stripePaymentLink: e.target.value }))}
            placeholder="Stripe Payment Link"
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm md:col-span-2"
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <select
            value={newCourse.status || 'draft'}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, status: e.target.value as CourseStatus }))}
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={newCourse.accessType || 'free'}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, accessType: e.target.value as CourseAccessType }))}
            className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          >
            {accessOptions.map((access) => (
              <option key={access} value={access}>
                {access}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
            Orden
            <input
              type="number"
              value={newCourse.order ?? 0}
              onChange={(e) => setNewCourse((prev) => ({ ...prev, order: Number(e.target.value) }))}
              className="w-20 rounded-xl border border-[var(--stroke)] px-2 py-1 text-sm"
            />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
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
        {visibleCourses.map((course) => {
          const draft = drafts[course.id] || {};
          const isExpanded = expandedId === course.id;
          return (
            <article key={course.id} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{course.title}</p>
                  <p className="text-xs text-[var(--ink-soft)]">{course.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)]"
                  >
                    Gestionar contenido
                  </Link>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : course.id)}
                    className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)]"
                  >
                    {isExpanded ? 'Cerrar' : 'Editar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveCourse(course.id)}
                    disabled={savingId === course.id}
                    className="rounded-xl bg-[var(--green-500)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)] disabled:opacity-60"
                  >
                    {savingId === course.id ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteCourse(course.id)}
                    disabled={savingId === course.id}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
                  >
                    Borrar
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--ink-soft)]">
                <span>{course.status}</span>
                <span>{course.accessType}</span>
                <span>Orden {course.order}</span>
              </div>

              {isExpanded ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="text-sm text-[var(--ink)]">
                    Titulo
                    <input
                      value={draft.title || ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, title: e.target.value },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm text-[var(--ink)]">
                    Slug
                    <input
                      value={draft.slug || ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, slug: e.target.value },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm text-[var(--ink)] md:col-span-2">
                    Descripcion corta
                    <textarea
                      value={draft.shortDescription || ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, shortDescription: e.target.value },
                        }))
                      }
                      className="mt-1 min-h-[80px] w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm text-[var(--ink)]">
                    Precio
                    <input
                      value={draft.price || ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, price: e.target.value },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm text-[var(--ink)]">
                    Precio oferta
                    <input
                      value={draft.salePrice || ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, salePrice: e.target.value },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm text-[var(--ink)]">
                    Moneda
                    <input
                      value={draft.currency || ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, currency: e.target.value },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm text-[var(--ink)] md:col-span-2">
                    Cover image URL
                    <input
                      value={draft.coverImage || ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, coverImage: e.target.value },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm text-[var(--ink)] md:col-span-2">
                    Stripe Payment Link
                    <input
                      value={draft.stripePaymentLink || ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, stripePaymentLink: e.target.value },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm text-[var(--ink)] md:col-span-2">
                    Descripcion larga
                    <textarea
                      value={draft.longDescription || ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, longDescription: e.target.value },
                        }))
                      }
                      className="mt-1 min-h-[120px] w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm text-[var(--ink)] md:col-span-2">
                    URL cover
                    <input
                      value={draft.coverImage || ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, coverImage: e.target.value },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm text-[var(--ink)]">
                    Estado
                    <select
                      value={draft.status || 'draft'}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, status: e.target.value as CourseStatus },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-[var(--ink)]">
                    Acceso
                    <select
                      value={draft.accessType || 'free'}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, accessType: e.target.value as CourseAccessType },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    >
                      {accessOptions.map((access) => (
                        <option key={access} value={access}>
                          {access}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-[var(--ink)]">
                    Orden
                    <input
                      type="number"
                      value={draft.order ?? 0}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, order: Number(e.target.value) },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                    />
                  </label>
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
