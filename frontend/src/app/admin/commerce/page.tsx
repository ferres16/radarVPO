'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { api } from '@/lib/api';
import type {
  CommercePromoRule,
  CommerceSettings,
  StripeAccountStatus,
  UserProfile,
} from '@/types';

const emptySettings: CommerceSettings = {
  proEnabled: true,
  coursesEnabled: true,
  maintenanceMessage:
    'El pago online está temporalmente en mantenimiento. Vuelve a intentarlo más adelante.',
  proPackGuideSlug: 'vpo-inicial',
  allowPromotionCodes: false,
  stripeAutomaticTax: false,
  proPriceCents: null,
};

const PACK_KEY = 'pro_pack_3m_grants_guide';

const KEY_MODE_LABEL: Record<StripeAccountStatus['keyMode'], string> = {
  live: 'Live (sk_live_)',
  test: 'Test (sk_test_) — no cobra de verdad',
  restricted: 'Restringida (rk_) — revisa permisos de Checkout',
  unknown: 'Formato no reconocido',
  missing: 'No configurada',
};

function yesNo(value: boolean | null) {
  if (value === null) return '—';
  return value ? 'Sí' : 'No';
}

export default function AdminCommercePage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [draft, setDraft] = useState<CommerceSettings>(emptySettings);
  const [packRule, setPackRule] = useState<CommercePromoRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [stripeStatus, setStripeStatus] = useState<StripeAccountStatus | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);

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
        const [settings, rules, stripe] = await Promise.all([
          api.getBackofficeCommerce(),
          api.getBackofficePromoRules(),
          api.getBackofficeStripeStatus().catch(() => null),
        ]);
        if (!active) return;
        setDraft({ ...emptySettings, ...settings });
        setPackRule(rules.find((rule) => rule.key === PACK_KEY) || null);
        setStripeStatus(stripe);
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
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6">
          <p className="text-sm text-[var(--ink-soft)]">Cargando comercio…</p>
        </article>
      </main>
    );
  }

  if (!me || me.role !== 'admin') {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Comercio</h1>
          <p className="mt-2 text-sm font-semibold text-red-700">{error || 'Acceso denegado.'}</p>
          <Link href="/admin" className="mt-4 inline-block text-sm font-bold text-[var(--green-700)]">
            Volver al panel
          </Link>
        </article>
      </main>
    );
  }

  const packPriceEuros = ((Number(packRule?.config.priceCents) || 2997) / 100).toFixed(2);

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-4">
        <header className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--green-700)]">
            Backoffice
          </p>
          <h1 className="display-type mt-2 text-3xl font-black text-[var(--ink)]">Comercio</h1>
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

        <section className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-[var(--ink)]">Estado de Stripe</h2>
            <button
              type="button"
              className="btn btn--secondary"
              disabled={stripeLoading}
              onClick={() => {
                setStripeLoading(true);
                api
                  .getBackofficeStripeStatus()
                  .then(setStripeStatus)
                  .catch((err) =>
                    setError(err instanceof Error ? err.message : 'No se pudo consultar Stripe.'),
                  )
                  .finally(() => setStripeLoading(false));
              }}
            >
              {stripeLoading ? 'Consultando…' : 'Probar conexión'}
            </button>
          </div>
          {stripeStatus ? (
            <dl className="grid gap-2 text-sm text-[var(--ink)] sm:grid-cols-2">
              <div>
                <dt className="text-[var(--ink-soft)]">Clave en Railway</dt>
                <dd className="font-semibold">{KEY_MODE_LABEL[stripeStatus.keyMode]}</dd>
              </div>
              <div>
                <dt className="text-[var(--ink-soft)]">Conexión a api.stripe.com</dt>
                <dd className="font-semibold">{stripeStatus.reachable ? 'OK' : 'Fallo'}</dd>
              </div>
              <div>
                <dt className="text-[var(--ink-soft)]">Webhook configurado</dt>
                <dd className="font-semibold">{yesNo(stripeStatus.webhookConfigured)}</dd>
              </div>
              <div>
                <dt className="text-[var(--ink-soft)]">Datos enviados (details_submitted)</dt>
                <dd className="font-semibold">{yesNo(stripeStatus.detailsSubmitted)}</dd>
              </div>
              <div>
                <dt className="text-[var(--ink-soft)]">Cobros live (charges_enabled)</dt>
                <dd className="font-semibold">{yesNo(stripeStatus.chargesEnabled)}</dd>
              </div>
              <div>
                <dt className="text-[var(--ink-soft)]">Ingresos (payouts_enabled)</dt>
                <dd className="font-semibold">{yesNo(stripeStatus.payoutsEnabled)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-[var(--ink-soft)]">Sin datos todavía.</p>
          )}
          {stripeStatus?.disabledReason ? (
            <p className="text-sm text-red-800">
              Stripe tiene la cuenta restringida: {stripeStatus.disabledReason}
            </p>
          ) : null}
          {stripeStatus?.error ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {stripeStatus.error}
            </p>
          ) : null}
          {stripeStatus?.currentlyDue?.length ? (
            <p className="text-sm text-[var(--ink-soft)]">
              Pendiente en Stripe: {stripeStatus.currentlyDue.join(', ')}
            </p>
          ) : null}
          {stripeStatus?.pastDue?.length ? (
            <p className="text-sm text-red-800">
              Caducado en Stripe: {stripeStatus.pastDue.join(', ')}
            </p>
          ) : null}
          {stripeStatus?.reachable &&
          !stripeStatus.currentlyDue?.length &&
          !stripeStatus.pastDue?.length &&
          stripeStatus.chargesEnabled ? (
            <p className="text-sm text-emerald-800">
              Stripe no tiene requisitos pendientes para cobrar. Si el checkout falla, el problema
              está en la conexión o en la clave de Railway, no en un formulario del Dashboard.
            </p>
          ) : null}
          <p className="text-xs leading-5 text-[var(--ink-soft)]">
            En el Dashboard (modo Live): Inicio (banner de activación), Settings → Account details →
            Requirements, Settings → Payment methods (Cards), y Desarrolladores → Claves (“Utilizada
            por última vez”). La clave restringida de la captura no vale: su política es “Ninguna”.
            Usa <code>sk_live_</code> o crea una restringida con permisos de Checkout Sessions,
            Customers y Webhooks.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-5 space-y-5">
          <h2 className="text-sm font-bold text-[var(--ink)]">Precio PRO mensual</h2>
          <label className="block text-sm font-semibold text-[var(--ink)]">
            Importe (€ / mes)
            <input
              className="ds-control mt-1 w-full max-w-xs"
              type="number"
              step="0.01"
              min="1"
              max="500"
              value={
                draft.proPriceCents && draft.proPriceCents > 0
                  ? (draft.proPriceCents / 100).toFixed(2)
                  : ''
              }
              placeholder="9.99"
              onChange={(e) => {
                const euros = Number(e.target.value);
                if (!e.target.value.trim()) {
                  setDraft((prev) => ({ ...prev, proPriceCents: null }));
                  return;
                }
                if (!Number.isFinite(euros) || euros <= 0) return;
                setDraft((prev) => ({
                  ...prev,
                  proPriceCents: Math.round(euros * 100),
                }));
              }}
            />
          </label>
          <p className="text-xs leading-5 text-[var(--ink-soft)]">
            Este precio es el que se cobra en Stripe Checkout al contratar PRO mensual. Vacío = usar
            el valor de entorno / default del código (9,99 €). El pack de 3 meses se configura aparte
            abajo.
          </p>
        </section>

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
                Déjalo desactivado mientras validas el producto y antes de darte de alta como
                autónomo. Solo actívalo cuando gestoría confirme IVA/facturación y Tax esté
                configurado en Stripe Dashboard. Checkout pedirá dirección de facturación.
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
        </div>
      </div>
    </main>
  );
}
