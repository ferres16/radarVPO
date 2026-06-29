'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Course, UserAccessSummary, UserProfile } from '@/types';
import { ProfileCard } from '@/components/profile-card';
import { StatusPill } from '@/components/status-pill';
import { proHref, proPlan } from '@/lib/pro';

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullNameDraft, setFullNameDraft] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [courses, setCourses] = useState<Array<Course & { access?: { canAccess: boolean; reason: string } }>>([]);
  const [coursesError, setCoursesError] = useState('');
  const [accessSummary, setAccessSummary] = useState<UserAccessSummary | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const profile = await api.getMe();
        if (active) {
          setMe(profile);
          setFullNameDraft(profile.fullName || '');
        }
      } catch {
        if (active) {
          setMe(null);
          setError('No has iniciado sesion o la sesion ha expirado.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const displayName = useMemo(() => {
    if (!me) return '';
    if (me.fullName) return me.fullName;
    return me.email.split('@')[0] || 'Usuario';
  }, [me]);

  async function saveProfile() {
    if (!me) return;
    setSavingProfile(true);
    setProfileMessage('');
    try {
      const updated = await api.updateMe({ fullName: fullNameDraft.trim() || '' });
      setMe(updated);
      setProfileMessage('Nombre actualizado correctamente.');
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : 'No se pudo actualizar el nombre');
    } finally {
      setSavingProfile(false);
    }
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await api.logout();
      router.push('/login');
    } finally {
      setLoggingOut(false);
    }
  }

  useEffect(() => {
    if (!me) return;
    let active = true;

    (async () => {
      try {
        const [list, access] = await Promise.all([
          api.listCoursesForUser(),
          api.getMyAccess().catch(() => null),
        ]);
        if (!active) return;
        setCourses(list);
        setAccessSummary(access);
      } catch {
        if (!active) return;
        setCoursesError('No se pudieron cargar todos los datos del perfil.');
      }
    })();

    return () => {
      active = false;
    };
  }, [me]);

  if (loading) {
    return (
      <main className="lp lp--inner">
        <div className="shell">
          <article className="public-card p-6">
          <p className="text-sm text-[var(--ink-soft)]">Cargando tu cuenta...</p>
          </article>
        </div>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="lp lp--inner">
        <div className="shell">
          <article className="public-card p-6">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Tu cuenta</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            {error || 'Para ver tus datos de perfil necesitas iniciar sesion.'}
          </p>
          <Link href="/login" className="mt-4 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">
            Iniciar sesion
          </Link>
          </article>
        </div>
      </main>
    );
  }

  const hasPro = me.plan === 'pro';
  const whatsappContactUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL ||
    'https://wa.me/34600111222?text=Hola%2C%20quiero%20activar%20el%20seguimiento%20individualizado%20de%20Radar%20VPO.';
  const lastLogin = me.lastLoginAt ? new Date(me.lastLoginAt) : null;
  const lastLoginLabel = lastLogin
    ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(lastLogin)
    : 'Sin registro';
  const activeCourses = courses.filter((course) => course.access?.canAccess);
  const lockedCourses = courses.filter((course) => !course.access?.canAccess);
  const activeServices = accessSummary?.services ?? [];
  const unlockedAccesses = [
    ...activeCourses.map((course) => ({ id: `course-${course.id}`, label: course.title, type: 'Curso' })),
    ...activeServices.map((item) => ({ id: `service-${item.service.id}`, label: item.service.name, type: 'Acompañamiento' })),
  ];

  return (
    <main className="lp lp--inner space-y-6">
      <div className="shell space-y-6 pb-8">
      <ProfileCard className="relative overflow-hidden bg-[linear-gradient(135deg,#f6fbff_0%,#eef6f8_50%,#ffffff_100%)]">
        <div className="pointer-events-none absolute -right-24 -top-20 h-56 w-56 rounded-full bg-[rgba(54,189,248,0.16)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[rgba(47,107,36,0.12)] blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Mi cuenta</p>
              <h1 className="mt-2 text-3xl font-black text-[var(--ink)] md:text-4xl display-type">{displayName}</h1>
              <p className="mt-1 max-w-2xl text-sm text-[var(--ink-soft)]">
                Gestiona tus datos, tu plan y los productos que tienes activos en Radar VPO.
              </p>
            </div>
            
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Estado del plan</p>
              <div className="mt-2">
                <StatusPill label={hasPro ? 'PRO activo' : 'Plan gratuito'} tone={hasPro ? 'active' : 'warning'} />
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Accesos desbloqueados</p>
              <p className="mt-1 text-2xl font-bold text-[var(--ink)]">{unlockedAccesses.length}</p>
              {coursesError ? <p className="mt-1 text-xs text-amber-700">{coursesError}</p> : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Último inicio de sesión</p>
              <p className="mt-1 text-lg font-semibold text-[var(--ink)]">{lastLoginLabel}</p>
            </div>
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Acompañamiento activo</p>
              <p className="mt-1 text-2xl font-bold text-[var(--ink)]">{activeServices.length}</p>
            </div>
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Cursos activos</p>
              <p className="mt-1 text-2xl font-bold text-[var(--ink)]">{activeCourses.length}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Nombre</span>
              <input
                value={fullNameDraft}
                onChange={(e) => setFullNameDraft(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--stroke)] bg-white px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Email</span>
              <input
                value={me.email}
                readOnly
                className="mt-1 w-full rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-2 text-[var(--ink-soft)]"
              />
            </label>
            <label className="text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Telefono</span>
              <input
                value={me.phone || ''}
                readOnly
                className="mt-1 w-full rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-2 text-[var(--ink-soft)]"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={savingProfile}
              className="inline-flex items-center rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)] disabled:opacity-60"
            >
              Guardar nombre
            </button>
            <Link
              href="/acompanamiento"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
            >
              Activar acompañamiento
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              disabled={loggingOut}
              className="inline-flex items-center rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              {loggingOut ? 'Cerrando...' : 'Cerrar sesión'}
            </button>
            {profileMessage ? (
              <p className="w-full text-xs font-semibold text-[var(--green-700)]">{profileMessage}</p>
            ) : null}
          </div>
        </div>
      </ProfileCard>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <ProfileCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Cursos activos</p>
              <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">Tu formación disponible</h2>
            </div>
            <Link href="/cursos" className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]">
              Ver catálogo
            </Link>
          </div>
          {activeCourses.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-[var(--stroke)] bg-[var(--bg-app)] p-4 text-sm text-[var(--ink-soft)]">
              Todavía no tienes cursos activos. Puedes comprar un curso o activar acompañamiento para desbloquear contenido.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {activeCourses.map((course) => (
                <Link key={course.id} href={`/cursos/${course.slug}`} className="block rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 transition hover:-translate-y-0.5 hover:bg-white">
                  <p className="font-semibold text-[var(--ink)]">{course.title}</p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{course.shortDescription || 'Curso disponible en tu cuenta.'}</p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-[var(--green-700)]">Ver curso</span>
                </Link>
              ))}
            </div>
          )}
        </ProfileCard>

        <ProfileCard className="bg-[linear-gradient(135deg,rgba(54,189,248,0.08),rgba(255,255,255,0.96))]">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--cyan-700)]">Acompañamiento contratado</p>
          <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">Acompañamiento activo</h2>
          {activeServices.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--stroke)] bg-white/70 p-4">
              <p className="text-sm leading-6 text-[var(--ink-soft)]">No hay acompañamiento activo en tu cuenta.</p>
              <Link href={whatsappContactUrl} className="mt-3 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">
                Activar acompañamiento
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {activeServices.map((item) => (
                <div key={item.service.id} className="rounded-2xl border border-[var(--stroke)] bg-white/80 p-4">
                  <p className="font-semibold text-[var(--ink)]">{item.service.name}</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">
                    Activo desde {new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(item.activatedAt))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ProfileCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <ProfileCard>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Accesos desbloqueados</p>
          <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">Todo lo que tienes disponible</h2>
          {unlockedAccesses.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-[var(--stroke)] bg-[var(--bg-app)] p-4 text-sm text-[var(--ink-soft)]">
              No hay accesos desbloqueados todavía.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {unlockedAccesses.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--green-700)]">{item.type}</p>
                  <p className="mt-1 font-semibold text-[var(--ink)]">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </ProfileCard>

        <ProfileCard className="border-[rgba(47,107,36,0.25)] bg-[linear-gradient(130deg,rgba(47,107,36,0.08),rgba(255,255,255,0.96))]">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Siguientes pasos</p>
          <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">Compra cursos o activa acompañamiento</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/cursos" className="inline-flex items-center justify-center rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">
              Ver cursos
            </Link>
            {!hasPro ? (
              <Link href={proHref} className="inline-flex items-center justify-center rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]">
                {proPlan.ctaLabel}
              </Link>
            ) : null}
            <Link href="/acompanamiento" className="inline-flex items-center justify-center rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]">
              Solicitar acompañamiento
            </Link>
            {!hasPro && lockedCourses.length > 0 ? (
              <Link href={proHref} className="inline-flex items-center justify-center rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]">
                Desbloquear más
              </Link>
            ) : null}
          </div>
        </ProfileCard>
      </section>
      </div>
    </main>
  );
}
