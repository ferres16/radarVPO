'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { FormField } from '@/components/design-system';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';

type WaitlistProduct = 'pro' | 'guide' | 'both';

export function WaitlistForm({
  product,
  maintenanceMessage,
  sourcePath,
}: {
  product: WaitlistProduct;
  maintenanceMessage: string;
  sourcePath?: string;
}) {
  const [email, setEmail] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [waitlistConsent, setWaitlistConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.joinWaitlist({
        email,
        product,
        municipality: municipality.trim() || undefined,
        waitlistConsent,
        marketingConsent,
        sourcePath,
      });
      trackEvent('waitlist_joined', { product });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar tu email.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mt-4 space-y-3" role="status">
        <p className="rounded-xl bg-[var(--bg-eco)] px-3 py-3 text-sm font-semibold text-[var(--green-700)]">
          Estás en la lista de espera. Te avisaremos por email cuando esta venta vuelva a estar disponible.
        </p>
        <p className="text-sm text-[var(--ink-soft)]">
          Mientras tanto puedes{' '}
          <Link href="/promotions" className="font-semibold text-[var(--green-700)] underline">
            consultar promociones gratis
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={onSubmit}>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
        {maintenanceMessage}
      </p>
      <p className="text-sm leading-6 text-[var(--ink-soft)]">
        Déjanos tu email y el producto que te interesa. No hay botón de compra activo mientras la venta esté cerrada.
      </p>
      <FormField id="waitlist-email" label="Email">
        <input
          id="waitlist-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="ds-control w-full"
        />
      </FormField>
      <FormField id="waitlist-municipality" label="Municipio de interés (opcional)">
        <input
          id="waitlist-municipality"
          value={municipality}
          onChange={(event) => setMunicipality(event.target.value)}
          className="ds-control w-full"
          placeholder="p. ej. Montgat"
        />
      </FormField>
      <label className="flex items-start gap-3 text-sm leading-6 text-[var(--ink)]">
        <input
          type="checkbox"
          checked={waitlistConsent}
          onChange={(event) => setWaitlistConsent(event.target.checked)}
          required
          className="mt-1 h-4 w-4 shrink-0"
        />
        <span>
          Quiero que me aviséis cuando este producto vuelva a estar a la venta. He leído la{' '}
          <Link href="/privacidad" className="font-semibold text-[var(--green-700)] underline">
            política de privacidad
          </Link>
          .
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm leading-6 text-[var(--ink)]">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(event) => setMarketingConsent(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0"
        />
        <span>
          Además, acepto recibir novedades y campañas futuras de Radar VPO (opcional, separado del aviso de
          preventa).
        </span>
      </label>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting || !waitlistConsent}
        className="btn btn--primary btn--lg btn--block"
      >
        {submitting ? 'Enviando…' : 'Apuntarme a la lista de espera'}
      </button>
    </form>
  );
}
