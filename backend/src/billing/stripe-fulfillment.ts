import { SubscriptionStatus } from '@prisma/client';

/**
 * Funciones puras para traducir eventos de Stripe al modelo de Radar VPO.
 * Se mantienen separadas del servicio para poder probarlas sin Stripe ni base de datos.
 */

export const PRO_PLAN_KEY = 'pro';
export const DEFAULT_PRO_PRICE_CENTS = 999;
/** Un curso con menos lecciones publicadas se muestra "en preparación" y no se vende. */
export const MIN_PUBLISHED_LESSONS_TO_SELL = 3;

export type CheckoutProduct = 'pro' | 'pro_pack_3m' | 'course';

export type CheckoutMetadata = {
  userId: string;
  product: CheckoutProduct;
  courseId?: string;
  courseSlug?: string;
  guideSlug?: string;
};

export function parseCheckoutMetadata(
  metadata: Record<string, string | null | undefined> | null | undefined,
  clientReferenceId?: string | null,
): CheckoutMetadata | null {
  const userId = (clientReferenceId || metadata?.userId || '').trim();
  const product = metadata?.product;
  if (
    !userId ||
    (product !== 'pro' && product !== 'pro_pack_3m' && product !== 'course')
  ) {
    return null;
  }
  if (product === 'course') {
    const courseId = metadata?.courseId?.trim();
    if (!courseId) return null;
    return {
      userId,
      product,
      courseId,
      courseSlug: metadata?.courseSlug?.trim() || undefined,
    };
  }
  return {
    userId,
    product,
    guideSlug: metadata?.guideSlug?.trim() || undefined,
  };
}

/** Estados de Stripe -> estados internos. `null` = no registrar todavía (pago pendiente). */
export function mapStripeSubscriptionStatus(
  status: string,
): SubscriptionStatus | null {
  switch (status) {
    case 'active':
      return SubscriptionStatus.active;
    case 'trialing':
      return SubscriptionStatus.trialing;
    case 'past_due':
    case 'unpaid':
      return SubscriptionStatus.past_due;
    case 'canceled':
      return SubscriptionStatus.canceled;
    case 'incomplete_expired':
      return SubscriptionStatus.expired;
    default:
      return null;
  }
}

/**
 * Mientras la suscripción esté activa (o en reintento de cobro) se mantiene el plan PRO.
 * Se retira solo cuando Stripe la da por terminada.
 */
export function shouldKeepProPlan(status: SubscriptionStatus): boolean {
  return (
    status === SubscriptionStatus.active ||
    status === SubscriptionStatus.trialing ||
    status === SubscriptionStatus.past_due
  );
}

type StripeSubscriptionLike = {
  status: string;
  cancel_at?: number | null;
  cancel_at_period_end?: boolean | null;
  current_period_start?: number;
  current_period_end?: number;
  items?: {
    data?: Array<{
      current_period_start?: number;
      current_period_end?: number;
    }>;
  };
};

function unixToDate(value?: number | null): Date | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Date(value * 1000)
    : null;
}

export function extractSubscriptionPeriod(sub: StripeSubscriptionLike) {
  const item = sub.items?.data?.[0];
  const start = unixToDate(sub.current_period_start ?? item?.current_period_start);
  const end = unixToDate(sub.current_period_end ?? item?.current_period_end);
  const scheduledCancel =
    unixToDate(sub.cancel_at) ??
    (sub.cancel_at_period_end ? end : null);
  return { start, end, cancelAt: scheduledCancel };
}

/** Importe en céntimos -> decimal con 2 decimales para la columna `amount`. */
export function centsToAmount(cents?: number | null): number | null {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) return null;
  return Math.round(cents) / 100;
}

export function amountToCents(amount: string | number | { toString(): string }) {
  const value = Number(amount.toString());
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

export function formatEuroAmount(cents: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}
