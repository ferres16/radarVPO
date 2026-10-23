'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FormField } from '@/components/design-system';
import { useProAccess } from '@/components/pro-access-provider';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { formatEuro } from '@/lib/offer';

export type CheckoutSummary = {
  product: 'pro' | 'pro_pack_3m' | 'course';
  courseSlug?: string;
  title: string;
  /** Importe visible, p. ej. "29 €" o "9,99 €". */
  priceLabel: string;
  /** Periodicidad, p. ej. "Pago único" o "al mes". */
  cadenceLabel: string;
  /** Nota sobre renovación / cancelación. */
  recurrenceNote: string;
  bullets: string[];
  backHref: string;
  backLabel: string;
};

export function CheckoutPanel({
  summary,
  canceled = false,
  layout = 'page',
}: {
  summary: CheckoutSummary;
  canceled?: boolean;
  layout?: 'page' | 'embedded';
}) {
  const { me, loading } = useProAccess();
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'El pago online todavía no está activo. Vuelve a intentarlo más adelante.',
  );
  const [apiProPriceLabel, setApiProPriceLabel] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedImmediate, setAcceptedImmediate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [accountMode, setAccountMode] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isCourse = summary.product === 'course';
  const isProProduct = summary.product === 'pro' || summary.product === 'pro_pack_3m';
  const alreadyPro = isProProduct && Boolean(me?.proAccess?.hasAccess ?? me?.plan === 'pro');
  const displayPriceLabel =
    isProProduct && apiProPriceLabel ? apiProPriceLabel : summary.priceLabel;
  const embedded = layout === 'embedded';

  useEffect(() => {
    trackEvent('checkout_viewed', { product: summary.product, course: summary.courseSlug ?? null });
    let active = true;
    api
      .getCheckoutStatus()
      .then((status) => {
        if (!active) return;
        const productEnabled = isCourse
          ? status.coursesEnabled
          : summary.product === 'pro_pack_3m'
            ? Boolean(status.proPackEnabled)
            : status.proEnabled;
        setPaymentsEnabled(Boolean(status.enabled && productEnabled));
        if (status.maintenanceMessage) setMaintenanceMessage(status.maintenanceMessage);
        if (summary.product === 'pro' && Number.isInteger(status.proPriceCents) && status.proPriceCents > 0) {
          setApiProPriceLabel(formatEuro(status.proPriceCents / 100, { decimals: 2 }));
        }
        if (
          summary.product === 'pro_pack_3m' &&
          Number.isInteger(status.proPackPriceCents) &&
          (status.proPackPriceCents ?? 0) > 0
        ) {
          setApiProPriceLabel(formatEuro((status.proPackPriceCents ?? 0) / 100, { decimals: 2 }));
        }
      })
      .catch(() => {
        if (active) setPaymentsEnabled(false);
      });
    return () => {
      active = false;
    };
  }, [summary.product, summary.courseSlug, isCourse]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (canceled || window.location.hash === '#pagar') {
      document.getElementById('pagar')?.scrollIntoView({ block: 'start' });
    }
  }, [canceled]);

  async function goToStripe() {
    const { url } = await api.createCheckout({
      product: summary.product,
      courseSlug: summary.courseSlug,
      acceptedTerms,
      acceptedImmediateAccess: acceptedImmediate,
    });
    window.location.assign(url);
  }

  async function startCheckout() {
    setSubmitting(true);
    setError('');
    trackEvent('checkout_started', { product: summary.product, course: summary.courseSlug ?? null });
    try {
      if (!me) {
        if (accountMode === 'register') {
          await api.register(email, password, fullName, undefined, true, false);
        } else {
          await api.login(email, password);
        }
      }
      await goToStripe();
    } catch (err) {
      trackEvent('checkout_failed', { product: summary.product });
      const message = err instanceof Error ? err.message : 'No se pudo iniciar el pago. Inténtalo de nuevo.';
      if (!me && accountMode === 'register' && /ya existe|already|registrad/i.test(message)) {
        setAccountMode('login');
        setError('Ese email ya tiene cuenta. Inicia sesión para pagar.');
      } else {
        setError(message);
      }
      setSubmitting(false);
    }
  }

  const accountReady =
    Boolean(me) ||
    (email.trim().length > 3 &&
      password.length >= 8 &&
      (accountMode === 'login' || fullName.trim().length >= 2));
  const canSubmit =
    acceptedTerms &&
    acceptedImmediate &&
    !submitting &&
    paymentsEnabled === true &&
    !alreadyPro &&
    !loading &&
    accountReady;

  const payLabel = submitting
    ? 'Redirigiendo a Stripe…'
    : me
      ? `Pagar ${displayPriceLabel} ${summary.cadenceLabel}`.trim()
      : accountMode === 'login'
        ? `Entrar y pagar ${displayPriceLabel}`
        : `Crear cuenta y pagar ${displayPriceLabel}`;

  const form = (
    <section className="public-card p-5 md:p-6" aria-labelledby="checkout-action-title">
      <h2 id="checkout-action-title" className="display-type text-xl font-black text-[var(--ink)]">
        {embedded ? summary.title : me ? 'Confirmar y pagar' : 'Cuenta y pago'}
      </h2>
      {embedded ? (
        <p className="mt-2 text-3xl font-black text-[var(--ink)]">
          {displayPriceLabel}{' '}
          <span className="text-base font-semibold text-[var(--ink-soft)]">{summary.cadenceLabel}</span>
        </p>
      ) : null}
      {embedded ? <p className="mt-2 text-sm text-[var(--ink-soft)]">{summary.recurrenceNote}</p> : null}
      {embedded && summary.bullets.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-sm leading-6 text-[var(--ink)]">
          {summary.bullets.slice(0, 4).map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="text-[var(--green-700)]" aria-hidden="true">
                ✓
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {canceled ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
          El pago se canceló y no se ha hecho ningún cargo. Puedes intentarlo de nuevo cuando quieras.
        </p>
      ) : null}

      {!loading && alreadyPro ? (
        <p className="mt-4 rounded-xl bg-[var(--bg-eco)] px-3 py-3 text-sm font-semibold text-[var(--green-700)]">
          Ya tienes Radar VPO PRO activo. Puedes gestionarlo en{' '}
          <Link href="/account" className="underline">
            Mi cuenta
          </Link>
          .
        </p>
      ) : (
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) void startCheckout();
          }}
        >
          {me ? (
            <p className="text-sm text-[var(--ink-soft)]">
              Sesión iniciada como <strong className="text-[var(--ink)]">{me.email}</strong>.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-6 text-[var(--ink-soft)]">
                {accountMode === 'register'
                  ? 'Crea la cuenta aquí mismo. En el siguiente paso pagas en Stripe.'
                  : 'Entra con tu cuenta para pagar en Stripe.'}
              </p>
              {accountMode === 'register' ? (
                <FormField id="buy-name" label="Nombre">
                  <input
                    id="buy-name"
                    autoComplete="given-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    minLength={2}
                    className="ds-control w-full"
                  />
                </FormField>
              ) : null}
              <FormField id="buy-email" label="Email">
                <input
                  id="buy-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="ds-control w-full"
                />
              </FormField>
              <FormField id="buy-password" label="Contraseña">
                <input
                  id="buy-password"
                  type="password"
                  autoComplete={accountMode === 'register' ? 'new-password' : 'current-password'}
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="ds-control w-full"
                />
              </FormField>
              <button
                type="button"
                className="text-sm font-semibold text-[var(--green-700)] underline"
                onClick={() => {
                  setAccountMode((current) => (current === 'register' ? 'login' : 'register'));
                  setError('');
                }}
              >
                {accountMode === 'register' ? 'Ya tengo cuenta' : 'Crear cuenta nueva'}
              </button>
            </div>
          )}

          <label className="flex items-start gap-3 text-sm leading-6 text-[var(--ink)]">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0"
            />
            <span>
              He leído y acepto las{' '}
              <Link href="/condiciones" target="_blank" className="font-semibold text-[var(--green-700)] underline">
                condiciones de contratación
              </Link>{' '}
              y la{' '}
              <Link href="/privacidad" target="_blank" className="font-semibold text-[var(--green-700)] underline">
                política de privacidad
              </Link>
              .
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm leading-6 text-[var(--ink)]">
            <input
              type="checkbox"
              checked={acceptedImmediate}
              onChange={(event) => setAcceptedImmediate(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0"
            />
            <span>
              {isCourse
                ? 'Quiero acceder al contenido de inmediato y, al ser digital, pierdo el desistimiento cuando empiece el acceso.'
                : 'Quiero activar la suscripción de inmediato. Si desisto en 14 días, abono la parte ya disfrutada.'}
            </span>
          </label>

          {paymentsEnabled === false ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
              {maintenanceMessage}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={!canSubmit} className="btn btn--primary btn--lg btn--block">
            {payLabel}
          </button>
          <p className="text-center text-xs text-[var(--ink-soft)]">
            Pago seguro con Stripe. No almacenamos los datos de tu tarjeta.
          </p>
        </form>
      )}
    </section>
  );

  if (embedded) {
    return form;
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-[1.1fr_0.9fr]">
      <section className="public-card p-5 md:p-6" aria-labelledby="checkout-summary-title">
        <p className="lp-eyebrow">Resumen del pedido</p>
        <h2 id="checkout-summary-title" className="display-type mt-2 text-xl font-black text-[var(--ink)]">
          {summary.title}
        </h2>
        <p className="mt-3 text-3xl font-black text-[var(--ink)]">
          {displayPriceLabel}{' '}
          <span className="text-base font-semibold text-[var(--ink-soft)]">{summary.cadenceLabel}</span>
        </p>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">{summary.recurrenceNote}</p>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--ink)]">
          {summary.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="text-[var(--green-700)]" aria-hidden="true">
                ✓
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-5 text-[var(--ink-soft)]">
          El precio de este resumen es el importe que se cobra. No se añade un recargo extra en el pago.
        </p>
        <Link href={summary.backHref} className="mt-4 inline-block text-sm font-bold text-[var(--green-700)]">
          {summary.backLabel}
        </Link>
      </section>
      {form}
    </div>
  );
}
