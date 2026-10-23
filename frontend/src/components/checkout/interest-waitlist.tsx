'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { FormField } from '@/components/design-system';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { formatEuro } from '@/lib/offer';
import type { SalesMode } from '@/types';

type InterestProduct = 'guide' | 'pro';

export function InterestWaitlist({
  product,
  title,
  priceLabel,
  cadenceLabel,
  salesMode,
  message,
  listPriceCents,
}: {
  product: InterestProduct;
  title: string;
  priceLabel: string;
  cadenceLabel: string;
  salesMode: SalesMode;
  message: string;
  listPriceCents?: number | null;
}) {
  const [email, setEmail] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const modeLabel =
    salesMode === 'maintenance'
      ? 'Mantenimiento temporal'
      : 'Prelanzamiento';

  const plannedPrice =
    product === 'guide' &&
    typeof listPriceCents === 'number' &&
    listPriceCents > 0
      ? formatEuro(listPriceCents / 100, { decimals: 2 })
      : null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || done) return;
    setSubmitting(true);
    setError('');
    try {
      await api.createInterestLead({
        email: email.trim(),
        product,
        source: `checkout:${product}`,
        marketingOptIn,
        privacyVersion: '2026-10',
      });
      trackEvent('interest_confirmed', { product, salesMode });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar tu interés. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="public-card p-5 md:p-6" aria-labelledby="interest-title">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--green-700)]">{modeLabel}</p>
      <h2 id="interest-title" className="display-type mt-2 text-xl font-black text-[var(--ink)]">
        {title}
      </h2>
      <p className="mt-3 text-3xl font-black text-[var(--ink)]">
        {plannedPrice ?? priceLabel}{' '}
        <span className="text-base font-semibold text-[var(--ink-soft)]">{cadenceLabel}</span>
      </p>
      {plannedPrice ? (
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Precio previsto · no es un cobro ni una reserva.</p>
      ) : null}
      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{message}</p>

      {done ? (
        <p className="mt-4 rounded-xl bg-[var(--bg-eco)] px-3 py-3 text-sm font-semibold text-[var(--green-700)]" role="status">
          Gracias. Te avisaremos cuando esté disponible. No hace falta crear una cuenta ahora.
        </p>
      ) : (
        <form className="mt-4 space-y-4" onSubmit={onSubmit}>
          <FormField id="interest-email" label="Email" hint="Solo para avisarte del lanzamiento de este producto.">
            <input
              id="interest-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="ds-control w-full"
            />
          </FormField>
          <label className="flex items-start gap-3 text-sm leading-6 text-[var(--ink)]">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(event) => setMarketingOptIn(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0"
            />
            <span>
              Quiero recibir también novedades y recursos de Radar VPO (opcional). Puedes cambiarlo cuando quieras. Ver{' '}
              <Link href="/privacidad" className="font-semibold text-[var(--green-700)] underline">
                privacidad
              </Link>
              .
            </span>
          </label>
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={submitting} className="btn btn--primary btn--lg btn--block">
            {submitting ? 'Enviando…' : 'Avísame cuando esté disponible'}
          </button>
        </form>
      )}
    </section>
  );
}
