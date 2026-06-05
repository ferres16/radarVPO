'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Promotion, UserAccessSummary, UserProfile } from '@/types';
import { ProfileCard } from '@/components/profile-card';
import { StatusPill } from '@/components/status-pill';

export default function AccountPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullNameDraft, setFullNameDraft] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [purchasedCoursesCount, setPurchasedCoursesCount] = useState(0);
  const [coursesError, setCoursesError] = useState('');
  const [favorites, setFavorites] = useState<Promotion[]>([]);
  const [accessSummary, setAccessSummary] = useState<UserAccessSummary | null>(null);

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

  useEffect(() => {
    if (!me) return;
    let active = true;

    (async () => {
      try {
        const [list, favoriteList, access] = await Promise.all([
          api.listCoursesForUser(),
          api.getFavorites().catch(() => []),
          api.getMyAccess().catch(() => null),
        ]);
        if (!active) return;
        const purchased = list.filter((course) => course.access?.reason === 'purchase');
        setPurchasedCoursesCount(purchased.length);
        setFavorites(favoriteList.map((item) => item.promotion).slice(0, 3));
        setAccessSummary(access);
      } catch {
        if (!active) return;
        setCoursesError('No se pudieron cargar todos los datos del dashboard.');
      }
    })();

    return () => {
      active = false;
    };
  }, [me]);

  if (loading) {
    return (
      <main className="shell">
        <article className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <p className="text-sm text-[var(--ink-soft)]">Cargando tu cuenta...</p>
        </article>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="shell">
        <article className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Tu cuenta</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            {error || 'Para ver tus datos de perfil necesitas iniciar sesion.'}
          </p>
          <Link href="/login" className="mt-4 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">
            Iniciar sesion
          </Link>
        </article>
      </main>
    );
  }

  const hasPro = me.plan === 'pro';
  const hasTracking = me.plan === 'pro';
  const stripeCheckoutUrl = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL || '/register';
  const whatsappContactUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL ||
    'https://wa.me/34600111222?text=Hola%2C%20quiero%20activar%20el%20seguimiento%20individualizado%20de%20Radar%20VPO.';
  const hasProGuide = hasPro;
  const lastLogin = me.lastLoginAt ? new Date(me.lastLoginAt) : null;
  const lastLoginLabel = lastLogin
    ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(lastLogin)
    : 'Sin registro';
  const activeServices = accessSummary?.services.length ?? 0;
  const activeCourses = accessSummary?.courses.length ?? purchasedCoursesCount;
  const dashboardCards = [
    { label: 'Solicitudes', value: '0', detail: 'Preparado para conectar con expediente cuando exista endpoint.' },
    { label: 'Favoritos', value: String(favorites.length), detail: 'Viviendas guardadas para seguimiento rápido.' },
    { label: 'Documentación', value: hasTracking ? 'En revisión' : 'Pendiente', detail: 'Bloque reservado para carpeta ciudadana.' },
    { label: 'Notificaciones', value: hasTracking ? 'Activas' : 'Básicas', detail: 'Alertas por municipio, régimen y fechas clave.' },
  ];

  return (
    <main className="shell space-y-6 pb-16">
      <ProfileCard className="relative overflow-hidden bg-[linear-gradient(135deg,#f6fbff_0%,#eef6f8_50%,#ffffff_100%)]">
        <div className="pointer-events-none absolute -right-24 -top-20 h-56 w-56 rounded-full bg-[rgba(54,189,248,0.16)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[rgba(47,107,36,0.12)] blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Perfil</p>
              <h1 className="mt-2 text-3xl font-black text-[var(--ink)] md:text-4xl display-type">{displayName}</h1>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{me.email}</p>
            </div>
            
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Seguimiento actualizado</p>
              <div className="mt-2">
                <StatusPill label={hasTracking ? 'Activo' : 'No activo'} tone={hasTracking ? 'active' : 'warning'} />
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Cursos comprados</p>
              <p className="mt-1 text-2xl font-bold text-[var(--ink)]">{purchasedCoursesCount}</p>
              {coursesError ? <p className="mt-1 text-xs text-amber-700">{coursesError}</p> : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Último inicio de sesión</p>
              <p className="mt-1 text-lg font-semibold text-[var(--ink)]">{lastLoginLabel}</p>
            </div>
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Servicios activos</p>
              <p className="mt-1 text-2xl font-bold text-[var(--ink)]">{activeServices}</p>
            </div>
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Cursos y guías</p>
              <p className="mt-1 text-2xl font-bold text-[var(--ink)]">{activeCourses}</p>
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
            {hasTracking ? (
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
              >
                Ver plan de seguimiento
              </Link>
            ) : (
              <Link
                href={whatsappContactUrl}
                className="inline-flex items-center justify-center rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
              >
                Activar seguimiento
              </Link>
            )}
            {profileMessage ? (
              <p className="w-full text-xs font-semibold text-[var(--green-700)]">{profileMessage}</p>
            ) : null}
            <p className="w-full text-xs text-[var(--ink-soft)]">Ideal si necesitas un plan personalizado para tu caso.</p>
          </div>
        </div>
      </ProfileCard>

      <section className="grid gap-4 md:grid-cols-4">
        {dashboardCards.map((card) => (
          <ProfileCard key={card.label} className="bg-white/88 transition hover:-translate-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">{card.label}</p>
            <p className="display-type mt-3 text-2xl font-black text-[var(--ink)]">{card.value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{card.detail}</p>
          </ProfileCard>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <ProfileCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Viviendas guardadas</p>
              <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">Favoritos para comparar</h2>
            </div>
            <Link href="/promotions" className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]">
              Buscar vivienda
            </Link>
          </div>
          {favorites.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-[var(--stroke)] bg-[var(--bg-app)] p-4 text-sm text-[var(--ink-soft)]">
              Aún no tienes viviendas favoritas. Guarda promociones para tener una comparación rápida desde tu perfil.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {favorites.map((promotion) => (
                <Link key={promotion.id} href={`/promotions/${promotion.id}`} className="block rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 transition hover:-translate-y-0.5 hover:bg-white">
                  <p className="font-semibold text-[var(--ink)]">{promotion.title}</p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{promotion.municipality || 'Catalunya'} {promotion.province ? `, ${promotion.province}` : ''}</p>
                </Link>
              ))}
            </div>
          )}
        </ProfileCard>

        <ProfileCard className="bg-[linear-gradient(135deg,rgba(167,28,32,0.06),rgba(255,255,255,0.96))]">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent-red)]">Roles y permisos</p>
          <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">Arquitectura preparada para escalar</h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--ink-soft)]">
            <p><strong className="text-[var(--ink)]">Ciudadano:</strong> favoritos, alertas, documentación y seguimiento propio.</p>
            <p><strong className="text-[var(--ink)]">Gestor:</strong> revisión de expedientes y soporte operativo.</p>
            <p><strong className="text-[var(--ink)]">Administrador:</strong> backoffice completo, accesos y contenido.</p>
          </div>
        </ProfileCard>
      </section>

      <section id="guia-pro" className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Guia PRO</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--ink)] display-type">Curso avanzado por modulos</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Lectura progresiva, contenidos vivos y navegacion lateral sin descargas.
          </p>
        </div>

        {hasProGuide ? (
          <ProfileCard className="border-[rgba(47,107,36,0.25)] bg-[linear-gradient(130deg,rgba(47,107,36,0.08),rgba(255,255,255,0.96))]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Indice del curso</p>
                <h3 className="mt-2 text-xl font-bold text-[var(--ink)]">Accede a todos los modulos en una sola pagina.</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Cada modulo tiene su propia pagina con contenido, recursos y multimedia.
                </p>
              </div>
              <Link
                href="/cursos"
                className="inline-flex items-center justify-center rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]"
              >
                Ver cursos
              </Link>
            </div>
          </ProfileCard>
        ) : (
          <ProfileCard className="border-[rgba(47,107,36,0.25)] bg-[linear-gradient(130deg,rgba(47,107,36,0.10),rgba(255,255,255,0.96))]">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <StatusPill label="Bloqueada" tone="locked" />
                <h3 className="mt-3 text-2xl font-black text-[var(--ink)]">Desbloquea la guia PRO con seguimiento.</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Accede a modulos, lecciones, FAQ y material vivo sin PDFs. Solo disponible con seguimiento activo.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                    href={stripeCheckoutUrl}
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]"
                >
                    Ir a Stripe Checkout
                </Link>
                <Link
                    href={whatsappContactUrl}
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
                >
                    Pedir seguimiento por WhatsApp
                </Link>
              </div>
            </div>
          </ProfileCard>
        )}
      </section>

      {me.role === 'admin' ? (
        <Link
          href="/admin"
          className="inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]"
        >
          Abrir panel de admin
        </Link>
      ) : null}
    </main>
  );
}
