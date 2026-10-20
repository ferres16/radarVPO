'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { api } from '@/lib/api';
import type { CommercePromoRule, CommerceSettings, UserProfile } from '@/types';

const emptySettings: CommerceSettings = {
  proEnabled: true,
  coursesEnabled: true,
  maintenanceMessage:
    'El pago online está temporalmente en mantenimiento. Vuelve a intentarlo más adelante.',
  proPackGuideSlug: 'vpo-inicial',
  allowPromotionCodes: false,
  stripeAutomaticTax: false,
};

const PACK_KEY = 'pro_pack_3m_grants_guide';

export default function AdminCommercePage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [draft, setDraft] = useState<CommerceSettings>(emptySettings);
  const [packRule, setPackRule] = useState<CommercePromoRule | null>(null);
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
        const [settings, rules] = await Promise.all([
          api.getBackofficeCommerce(),
          api.getBackofficePromoRules(),
        ]);
        if (!active) return;
        setDraft({ ...emptySettings, ...settings });
        setPackRule(rules.find((rule) => rule.key === PACK_KEY) || null);
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
      setDraft({ ...emptySettings, ...updated });
      if (packRule) {
        const next = await api.updateBackofficePromoRule(PACK_KEY, {
          enabled: packRule.enabled,
          config: {
            guideSlug: draft.proPackGuideSlug || 'vpo-inicial',
            months: Number(packRule.config.months) || 3,
            priceCents: Number(packRule.config.priceCents) || 2997,
          },
        });
        setPackRule(next);
      }
      setMessage('Ajustes de comercio y pack guardados.');
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

  const packPriceEuros = ((Number(packRule?.config.priceCents) || 2997) / 100).toFixed(2);

  return (
    <div className="admin-shell">
      <AdminNav />
      <main className="admin-main space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Backoffice</p>
          <h1 className="display-type mt-1 text-3xl font-black text-[var(--ink)]">Comercio</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            Pausar ventas, cupones Stripe y pack PRO 3 meses (incluye guía). Textos de email/SMS en{' '}
            <Link href="/admin/message-templates" className="font-semibold text-[var(--green-700)]">
              Emails / SMS
            </Link>
            .
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
          <h2 className="text-sm font-bold text-[var(--ink)]">Interruptores</h2>
          <label className="flex items-start gap-3 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={draft.proEnabled}
              onChange={(e) => setDraft((prev) => ({ ...prev, proEnabled: e.target.checked }))}
            />
            <span>
              <strong className="font-bold">Venta de Radar VPO PRO</strong>
              <span className="mt-1 block text-[var(--ink-soft)]">Mensual y pack 3 meses.</span>
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
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={draft.allowPromotionCodes}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, allowPromotionCodes: e.target.checked }))
              }
            />
            <span>
              <strong className="font-bold">Cupones Stripe en Checkout</strong>
              <span className="mt-1 block text-[var(--ink-soft)]">
                El cliente podrá escribir un código. Crea el cupón en Stripe Dashboard → Productos →
                Cupones.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={draft.stripeAutomaticTax}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, stripeAutomaticTax: e.target.checked }))
              }
            />
            <span>
              <strong className="font-bold">Stripe Tax (automatic_tax)</strong>
              <span className="mt-1 block text-[var(--ink-soft)]">
                Actívalo solo tras confirmar IVA con gestoría y configurar Tax en Stripe Dashboard.
                Checkout pedirá dirección de facturación.
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
        </section>

        <section className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-5 space-y-5">
          <h2 className="text-sm font-bold text-[var(--ink)]">Descuento / pack: PRO 3 meses → guía gratis</h2>
          <label className="flex items-start gap-3 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={Boolean(packRule?.enabled)}
              onChange={(e) =>
                setPackRule((prev) =>
                  prev ? { ...prev, enabled: e.target.checked } : prev,
                )
              }
            />
            <span>
              <strong className="font-bold">Activar pack PRO 3 meses</strong>
              <span className="mt-1 block text-[var(--ink-soft)]">
                Cobro cada 3 meses e incluye acceso permanente a la guía configurada.
              </span>
            </span>
          </label>

          <label className="block text-sm font-semibold text-[var(--ink)]">
            Slug de la guía incluida
            <input
              className="ds-control mt-1 w-full"
              value={draft.proPackGuideSlug}
              onChange={(e) => setDraft((prev) => ({ ...prev, proPackGuideSlug: e.target.value }))}
            />
          </label>

          <label className="block text-sm font-semibold text-[var(--ink)]">
            Precio del pack (€)
            <input
              className="ds-control mt-1 w-full"
              type="number"
              step="0.01"
              min="1"
              value={packPriceEuros}
              onChange={(e) => {
                const euros = Number(e.target.value);
                const cents = Number.isFinite(euros) ? Math.round(euros * 100) : 2997;
                setPackRule((prev) =>
                  prev
                    ? { ...prev, config: { ...prev.config, priceCents: cents } }
                    : prev,
                );
              }}
            />
          </label>
        </section>

        <button type="button" className="btn btn--primary" disabled={saving} onClick={() => void save()}>
          {saving ? 'Guardando…' : 'Guardar ajustes'}
        </button>
      </main>
    </div>
  );
}
