'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useProAccess } from '@/components/pro-access-provider';
import { api } from '@/lib/api';
import { trackPurchaseConversion } from '@/lib/conversion-pixels';
import { formatEuro } from '@/lib/offer';
import type { CheckoutResult } from '@/types';

const POLL_MS = 2500;
const POLL_MAX = 12;

export function GraciasClient() {
  const search = useSearchParams();
  const router = useRouter();
  const sessionId = search.get('session_id') || '';
  const { me, loading: meLoading, refresh } = useProAccess();
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resending, setResending] = useState(false);
  const [polls, setPolls] = useState(0);

  const load = useCallback(async () => {
    if (!sessionId) {
      setError('Falta la referencia de pago. Si ya pagaste, entra en Mi cuenta.');
      return;
    }
    try {
      const data = await api.getCheckoutResult(sessionId);
      setResult(data);
      setError('');
      if (data.uiStatus === 'confirmed') {
        const value =
          typeof data.amountTotal === 'number' ? data.amountTotal / 100 : 0;
        trackPurchaseConversion({
          product: data.product,
          courseSlug:
            data.product === 'course'
              ? data.ctaHref.replace(/^\/cursos\//, '').split(/[?#]/)[0]
              : null,
          money: {
            value,
            currency: data.currency,
            transactionId: data.transactionId,
          },
        });
        void refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo comprobar el pago.');
    }
  }, [refresh, sessionId]);

  useEffect(() => {
    if (meLoading) return;
    if (!me) {
      const next = encodeURIComponent(`/gracias?session_id=${sessionId}`);
      router.replace(`/login?next=${next}`);
      return;
    }
    void load();
  }, [load, me, meLoading, router, sessionId]);

  useEffect(() => {
    if (!result || result.uiStatus !== 'processing') return;
    if (polls >= POLL_MAX) return;
    const timer = window.setTimeout(() => {
      setPolls((n) => n + 1);
      void load();
    }, POLL_MS);
    return () => window.clearTimeout(timer);
  }, [load, polls, result]);

  async function resendVerification() {
    setResending(true);
    setResendMsg('');
    try {
      const out = await api.resendVerificationEmail();
      setResendMsg(out.message);
    } catch (err) {
      setResendMsg(err instanceof Error ? err.message : 'No se pudo reenviar.');
    } finally {
      setResending(false);
    }
  }

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (meLoading || (!result && !error && me)) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div
          className={`mb-4 h-12 w-12 rounded-full border-4 border-[var(--green-700)] border-t-transparent ${reduceMotion ? '' : 'animate-spin'}`}
          aria-hidden
        />
        <p className="text-sm font-semibold text-[var(--ink)]">Comprobando tu pago con Stripe…</p>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          No confirmamos la compra solo por esta URL: validamos el estado en el servidor.
        </p>
      </main>
    );
  }

  if (error && !result) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="display-type text-2xl font-black text-[var(--ink)]">No pudimos confirmar el pago</h1>
        <p className="mt-3 text-sm text-red-800" role="alert">
          {error}
        </p>
        <Link href="/account" className="btn btn--primary btn--lg mt-6 inline-flex">
          Ir a mi cuenta
        </Link>
      </main>
    );
  }

  if (!result) return null;

  const statusCopy = {
    confirmed: {
      title: '¡Pago confirmado!',
      body: `Gracias. Ya tienes acceso a ${result.productTitle}.`,
      tone: 'ok' as const,
    },
    processing: {
      title: 'Pago recibido, activando acceso…',
      body: 'Stripe ha confirmado el cobro. Estamos actualizando tus permisos; esto suele tardar unos segundos.',
      tone: 'wait' as const,
    },
    pending: {
      title: 'Pago pendiente',
      body: 'Todavía no consta el cobro como completado. Si acabas de pagar, espera un momento o revisa el correo de Stripe.',
      tone: 'wait' as const,
    },
    failed: {
      title: 'El pago no se completó',
      body: 'No se ha concedido acceso. Puedes volver a intentar el pago cuando quieras.',
      tone: 'bad' as const,
    },
  }[result.uiStatus];

  const priceLabel =
    typeof result.amountTotal === 'number'
      ? formatEuro(result.amountTotal / 100, { decimals: 2 })
      : null;

  return (
    <main className="relative overflow-hidden px-4 py-12 md:py-16">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(22,112,85,0.18),transparent_60%)] ${reduceMotion ? '' : 'gracias-glow'}`}
        aria-hidden
      />
      <div className="relative mx-auto max-w-lg">
        <div
          className={`public-card overflow-hidden p-6 md:p-8 ${reduceMotion ? '' : 'gracias-card-in'}`}
        >
          <p className="lp-eyebrow">Radar VPO</p>
          <div className="mt-4 flex items-start gap-3">
            <span
              className={`mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black text-white ${
                statusCopy.tone === 'ok'
                  ? 'bg-[var(--green-700)]'
                  : statusCopy.tone === 'bad'
                    ? 'bg-red-600'
                    : 'bg-amber-500'
              } ${reduceMotion || statusCopy.tone !== 'ok' ? '' : 'gracias-pop'}`}
              aria-hidden
            >
              {statusCopy.tone === 'ok' ? '✓' : statusCopy.tone === 'bad' ? '!' : '…'}
            </span>
            <div>
              <h1 className="display-type text-2xl font-black leading-tight text-[var(--ink)] md:text-3xl">
                {statusCopy.title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{statusCopy.body}</p>
            </div>
          </div>

          <dl className="mt-6 space-y-2 rounded-2xl bg-[var(--bg-eco)] px-4 py-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--ink-soft)]">Producto</dt>
              <dd className="font-semibold text-[var(--ink)]">{result.productTitle}</dd>
            </div>
            {priceLabel ? (
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ink-soft)]">Importe</dt>
                <dd className="font-semibold text-[var(--ink)]">
                  {priceLabel} {result.currency}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--ink-soft)]">Referencia</dt>
              <dd className="break-all font-mono text-xs text-[var(--ink)]">{result.transactionId}</dd>
            </div>
          </dl>

          {result.uiStatus === 'confirmed' || result.uiStatus === 'processing' ? (
            <div className="mt-6 space-y-3">
              <Link
                href={result.ctaHref}
                className="btn btn--primary btn--lg btn--block"
                aria-disabled={result.uiStatus === 'processing'}
              >
                {result.product === 'course'
                  ? result.ctaLabel.includes('guía')
                    ? `Ir a mi guía · ${result.productTitle}`
                    : `Ir a mi curso · ${result.productTitle}`
                  : result.ctaLabel}
              </Link>
              {result.uiStatus === 'processing' ? (
                <p className="text-center text-xs text-[var(--ink-soft)]" role="status" aria-live="polite">
                  Actualizando permisos automáticamente…
                </p>
              ) : null}
            </div>
          ) : null}

          {result.uiStatus === 'failed' || result.uiStatus === 'pending' ? (
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/pro#pagar" className="btn btn--primary btn--lg btn--block">
                Volver a intentar
              </Link>
              <Link href="/account" className="btn btn--secondary btn--lg btn--block">
                Ir a mi cuenta
              </Link>
            </div>
          ) : null}

          {!result.emailVerified ? (
            <section
              className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950"
              aria-labelledby="verify-reminder-title"
            >
              <h2 id="verify-reminder-title" className="font-black">
                Verifica tu email
              </h2>
              <p className="mt-2 leading-6">
                Tu compra puede estar activa, pero algunas funciones (avisos PRO y ciertas acciones de cuenta)
                requieren email verificado. Te enviamos un enlace a{' '}
                <strong>{result.email || 'tu correo'}</strong>.
              </p>
              <button
                type="button"
                className="btn btn--secondary mt-3"
                disabled={resending}
                onClick={() => void resendVerification()}
              >
                {resending ? 'Enviando…' : 'Reenviar correo de verificación'}
              </button>
              {resendMsg ? (
                <p className="mt-2 text-xs font-semibold" role="status">
                  {resendMsg}
                </p>
              ) : null}
            </section>
          ) : null}

          <p className="mt-6 text-center text-xs text-[var(--ink-soft)]">
            Recarga esta página no duplica cobros ni emails de confirmación.
          </p>
        </div>
      </div>
      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          .gracias-card-in {
            animation: gracias-in 0.55s ease-out both;
          }
          .gracias-pop {
            animation: gracias-pop 0.5s ease-out 0.15s both;
          }
          .gracias-glow {
            animation: gracias-glow 6s ease-in-out infinite alternate;
          }
          @keyframes gracias-in {
            from {
              opacity: 0;
              transform: translateY(12px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: none;
            }
          }
          @keyframes gracias-pop {
            from {
              transform: scale(0.6);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes gracias-glow {
            from {
              opacity: 0.7;
            }
            to {
              opacity: 1;
            }
          }
        }
      `}</style>
    </main>
  );
}
