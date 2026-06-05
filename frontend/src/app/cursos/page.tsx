'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { SkeletonCard } from '@/components/skeleton-card';
import { StatusPill } from '@/components/status-pill';
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

const formatPrice = (price?: string | number | null, currency?: string | null) => {
  if (!price) return null;
  const amount = typeof price === 'string' ? Number(price) : price;
  if (!Number.isFinite(amount)) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 0,
  }).format(amount as number);
};

const isExternalUrl = (href: string) => /^https?:\/\//.test(href);

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [accessMap, setAccessMap] = useState<Record<string, CourseAccessDecision>>({});
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
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
        setIsAuthed(true);
      } catch {
        if (!active) return;
        setAccessMap({});
        setIsAuthed(false);
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
      <main className="shell grid gap-4 pb-16 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
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
          <h1 className="display-type text-4xl font-black text-[var(--ink)] sm:text-5xl">
            Cursos premium para ganar claridad antes de cada convocatoria.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            Compra cursos puntuales con Stripe Payment Links, desbloquea contenido desde tu acceso activo y avanza por modulos con progreso guardado.
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

      {isAuthed === false ? (
        <article className="rounded-2xl border border-[var(--stroke)] bg-white p-4 text-sm text-[var(--ink-soft)]">
          Para entrar en cualquier curso necesitas iniciar sesion. Puedes ver el catalogo sin registrarte.
        </article>
      ) : null}

      {visibleCourses.length === 0 ? (
        <EmptyState
          title="Aun no hay cursos publicados"
          description="El catalogo se mostrara aqui cuando el equipo publique el primer curso."
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleCourses.map((course) => {
          const access = accessMap[course.id];
          const badge = accessLabels[course.accessType] || 'Acceso';
          const hasSession = isAuthed === true;
          const isLocked = hasSession ? (access ? !access.canAccess : course.accessType !== 'free') : course.accessType !== 'free';
          const priceLabel = formatPrice(course.price, course.currency);
          const ctaHref = !hasSession
            ? (course.accessType === 'free' ? `/cursos/${course.slug}` : course.stripePaymentLink || '/login')
            : !isLocked
              ? `/cursos/${course.slug}`
              : course.stripePaymentLink || '/services';
          const ctaLabel = !hasSession
            ? (course.accessType === 'free' ? 'Ver curso' : course.stripePaymentLink ? 'Comprar curso' : 'Inicia sesion')
            : !isLocked
              ? 'Continuar'
              : course.stripePaymentLink
                ? 'Comprar curso'
                : 'Solicitar acceso';
          const external = isExternalUrl(ctaHref);
          return (
            <article key={course.id} className="group relative overflow-hidden rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(30,31,28,0.13)]">
              <div className="absolute -right-10 top-6 h-24 w-24 rounded-full bg-[rgba(14,116,144,0.08)] blur-2xl" />
              <div className="relative space-y-4">
                {course.coverImage ? (
                  <div className="relative h-40 overflow-hidden rounded-2xl border border-[var(--stroke)]">
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.0),rgba(0,0,0,0.4))]" />
                    <Image
                      src={course.coverImage}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-40 items-end rounded-2xl border border-[var(--stroke)] bg-[radial-gradient(circle_at_top,#dcfce7,#f8fafc_65%)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--green-700)]">Radar VPO Academy</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accessTone[course.accessType] || 'bg-slate-100 text-slate-700'}`}>
                    {badge}
                  </span>
                  <StatusPill label={isLocked ? 'Bloqueado' : 'Activo'} tone={isLocked ? 'locked' : 'active'} />
                </div>
                <div>
                  <h2 className="display-type text-xl font-black text-[var(--ink)]">
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
                  <div className="flex items-center gap-3">
                    {priceLabel ? (
                      <span className="text-xs font-semibold text-[var(--ink)]">{priceLabel}</span>
                    ) : null}
                    {external ? (
                      <a
                        href={ctaHref}
                        className="rounded-full bg-[var(--green-500)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--green-700)]"
                        rel="noopener noreferrer"
                      >
                        {ctaLabel}
                      </a>
                    ) : (
                      <Link
                        href={ctaHref}
                        className="rounded-full bg-[var(--green-500)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--green-700)]"
                      >
                        {ctaLabel}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
