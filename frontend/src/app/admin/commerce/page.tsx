'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { api } from '@/lib/api';
import type { CommerceSettings, UserProfile } from '@/types';

const emptySettings: CommerceSettings = {
  proEnabled: true,
  coursesEnabled: true,
  maintenanceMessage:
    'El pago online está temporalmente en mantenimiento. Vuelve a intentarlo más adelante.',
  proPackGuideSlug: 'vpo-inicial',
};

export default function AdminCommercePage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [draft, setDraft] = useState<CommerceSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const profile = await api.getMe();
        if (!active) return;
        setMe(profile);
        if (profile.role !== 'admin') {
          setError('No tienes permisos de administrador.');
          return;
        }
        const settings = await api.getBackofficeCommerce();
        if (!active) return;
        setDraft(settings);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el comercio.');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await api.updateBackofficeCommerce(draft);
      setDraft(updated);
      setMessage('Ajustes de comercio guardados. El checkout los aplica al instante.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los ajustes.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-shell">
        <AdminNav />
        <main className="admin-main">
          <p className="text-sm text-[var(--ink-soft)]">Cargando comercio…</p>
        </main>
      </div>
    );
  }

  if (!me || me.role !== 'admin') {
    return (
      <div className="admin-shell">
        <AdminNav />
        <main className="admin-main">
          <p className="text-sm font-semibold text-red-700">{error || 'Acceso denegado.'}</p>
          <Link href="/" className="mt-4 inline-block text-sm font-bold text-[var(--green-700)]">
            Volver al inicio
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminNav />
      <main className="admin-main space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Backoffice</p>
          <h1 className="display-type mt-1 text-3xl font-black text-[var(--ink)]">Comercio</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            Activa o pausa PRO y la venta de cursos/guías sin tocar Stripe. Útil para mantenimiento o
            lanzamientos controlados.
          </p>
        </header>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
            {message}
          </p>
        ) : null}

        <section className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-5 space-y-5">
          <label className="flex items-start gap-3 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={draft.proEnabled}
              onChange={(e) => setDraft((prev) => ({ ...prev, proEnabled: e.target.checked }))}
            />
            <span>
              <strong className="font-bold">Venta de Radar VPO PRO</strong>
              <span className="mt-1 block text-[var(--ink-soft)]">
                Si lo desactivas, el checkout de suscripción muestra el mensaje de mantenimiento.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={draft.coursesEnabled}
              onChange={(e) => setDraft((prev) => ({ ...prev, coursesEnabled: e.target.checked }))}
            />
            <span>
              <strong className="font-bold">Venta de cursos y guías</strong>
              <span className="mt-1 block text-[var(--ink-soft)]">
                Controla los pagos únicos. No afecta a quien ya compró.
              </span>
            </span>
          </label>

          <label className="block text-sm font-semibold text-[var(--ink)]">
            Mensaje de mantenimiento
            <textarea
              className="ds-control mt-1 min-h-24 w-full"
              value={draft.maintenanceMessage}
              onChange={(e) => setDraft((prev) => ({ ...prev, maintenanceMessage: e.target.value }))}
            />
          </label>

          <label className="block text-sm font-semibold text-[var(--ink)]">
            Slug de la guía del pack PRO 3 meses
            <input
              className="ds-control mt-1 w-full"
              value={draft.proPackGuideSlug}
              onChange={(e) => setDraft((prev) => ({ ...prev, proPackGuideSlug: e.target.value }))}
            />
            <span className="mt-1 block text-xs font-normal text-[var(--ink-soft)]">
              Se usará cuando activemos el pack trimestral (por defecto <code>vpo-inicial</code>).
            </span>
          </label>

          <button
            type="button"
            className="btn btn--primary"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? 'Guardando…' : 'Guardar ajustes'}
          </button>
        </section>

        <p className="text-xs text-[var(--ink-soft)]">
          Las anulaciones de PRO se gestionan en{' '}
          <Link href="/admin/cancellations" className="font-semibold text-[var(--green-700)]">
            Anulaciones
          </Link>
          . Accesos manuales en{' '}
          <Link href="/admin/access" className="font-semibold text-[var(--green-700)]">
            Compras y accesos
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
