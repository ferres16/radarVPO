'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { UserProfile } from '@/types';
import { ProfileCard } from '@/components/profile-card';
import { StatusPill } from '@/components/status-pill';
import { ServiceCard } from '@/components/service-card';

const proBenefits = [
  'Alertas antes que nadie con SMS y WhatsApp.',
  'Guia completa en formato curso, sin descargar PDF.',
  'Seguimiento individualizado con asesoria real.',
];

export default function AccountPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [proAlertsEnabled, setProAlertsEnabled] = useState(false);
  const [fullNameDraft, setFullNameDraft] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

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
    if (me) {
      setProAlertsEnabled(me.plan === 'pro');
    }
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
  const hasBasicGuide = true;
  const hasProGuide = hasTracking;
  const hasProAlerts = hasPro;
  const activeServices = [hasBasicGuide, hasProGuide, hasProAlerts, hasTracking].filter(Boolean).length;

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
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label={hasPro ? 'Plan PRO' : 'Plan Free'} tone={hasPro ? 'active' : 'neutral'} />
              <StatusPill
                label={hasTracking ? 'Seguimiento activo' : 'Seguimiento no activo'}
                tone={hasTracking ? 'active' : 'warning'}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Servicios activos</p>
              <p className="mt-1 text-2xl font-bold text-[var(--ink)]">{activeServices} / 4</p>
            </div>
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Canal preferido</p>
              <p className="mt-1 text-lg font-semibold text-[var(--ink)]">WhatsApp + SMS</p>
            </div>
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Ultima revision</p>
              <p className="mt-1 text-lg font-semibold text-[var(--ink)]">Hoy, 08:30</p>
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
              {savingProfile ? 'Guardando...' : 'Guardar nombre'}
            </button>
            <p className="text-xs text-[var(--ink-soft)]">
              Para cambiar email o telefono, contacta por WhatsApp.
            </p>
          </div>
          {profileMessage ? (
            <p className="mt-2 text-xs text-[var(--ink-soft)]">{profileMessage}</p>
          ) : null}
        </div>
      </ProfileCard>

      {!hasPro ? (
        <ProfileCard className="border-[rgba(54,189,248,0.4)] bg-[linear-gradient(140deg,rgba(54,189,248,0.12),rgba(255,255,255,0.96))]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Upgrade PRO</p>
              <h2 className="mt-2 text-2xl font-black text-[var(--ink)] display-type">Activa Radar VPO PRO y recibe alertas antes que nadie.</h2>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                Guia avanzada, alertas pro y seguimiento individualizado para no perder oportunidades.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-[var(--ink)]">
              {proBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--green-500)]" />
                  <span>{benefit}</span>
                </div>
              ))}
              <Link
                href="/services"
                className="mt-3 inline-flex items-center justify-center rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]"
              >
                Activar PRO
              </Link>
            </div>
          </div>
        </ProfileCard>
      ) : null}

      <section id="mis-servicios" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Mis servicios</p>
            <h2 className="mt-2 text-2xl font-black text-[var(--ink)] display-type">Tu paquete activo y lo que te falta.</h2>
          </div>
          <Link
            href="/services"
            className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
          >
            Ver planes
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ServiceCard
            eyebrow="Guia basica"
            title="Guia VPO esencial"
            description="Resumen claro en PDF con conceptos clave, requisitos y calendario general."
            statusLabel={hasBasicGuide ? 'Activa' : 'Bloqueada'}
            statusTone={hasBasicGuide ? 'active' : 'locked'}
            cta={
              hasBasicGuide
                ? { label: 'Ver guia', href: '/curso/guia-vpo-esencial', variant: 'ghost' }
                : { label: 'Comprar guia', href: '/services' }
            }
          >
            <div className="flex items-center justify-between text-xs text-[var(--ink-soft)]">
              <span>Formato PDF</span>
              <span>Actualizada 2026</span>
            </div>
          </ServiceCard>

          <ServiceCard
            eyebrow="Guia PRO"
            title="Curso avanzado Radar VPO"
            description="Contenido modular y progresivo con explicaciones, checklist y FAQ avanzada."
            statusLabel={hasProGuide ? 'Desbloqueada' : 'Bloqueada'}
            statusTone={hasProGuide ? 'active' : 'locked'}
            cta={
              hasProGuide
                ? { label: 'Acceder', href: '/curso/guia-pro', variant: 'ghost' }
                : { label: 'Activar seguimiento', href: '/services' }
            }
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Desbloqueada con seguimiento
            </p>
          </ServiceCard>

          <ServiceCard
            eyebrow="Alertas PRO"
            title="Alertas instantaneas"
            description="Notificaciones prioritarias via WhatsApp y SMS con cambios clave."
            statusLabel={hasProAlerts ? 'Activas' : 'Bloqueadas'}
            statusTone={hasProAlerts ? 'active' : 'locked'}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-[var(--ink-soft)]">
                WhatsApp / SMS
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={proAlertsEnabled}
                disabled={!hasProAlerts}
                onClick={() => setProAlertsEnabled((value) => !value)}
                className={`relative inline-flex h-6 w-12 items-center rounded-full border transition ${
                  proAlertsEnabled ? 'border-emerald-300 bg-emerald-100' : 'border-[var(--stroke)] bg-white'
                } ${hasProAlerts ? '' : 'cursor-not-allowed opacity-60'}`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white shadow transition ${
                    proAlertsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--ink-soft)]">
              {hasProAlerts ? 'Plan PRO activo.' : 'Necesitas PRO para activar canales.'}
            </p>
          </ServiceCard>

          <ServiceCard
            eyebrow="Seguimiento"
            title="Seguimiento individualizado"
            description="Asesoria premium con pasos concretos, revision de requisitos y soporte directo."
            statusLabel={hasTracking ? 'Activo' : 'No activo'}
            statusTone={hasTracking ? 'active' : 'warning'}
            cta={
              hasTracking
                ? { label: 'Ver plan de seguimiento', href: '/services', variant: 'ghost' }
                : { label: 'Activar seguimiento', href: '/services' }
            }
          >
            <p className="text-xs text-[var(--ink-soft)]">Ideal si necesitas un plan personalizado para tu caso.</p>
          </ServiceCard>
        </div>
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
                href="/curso/guia-pro"
                className="inline-flex items-center justify-center rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]"
              >
                Ver guia PRO
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
                  href="/services"
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]"
                >
                  Activar PRO
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
                >
                  Acceder seguimiento
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
