import { SubscriptionStatus } from '@prisma/client';

/**
 * Funciones puras para traducir eventos de Stripe al modelo de Radar VPO.
 * Se mantienen separadas del servicio para poder probarlas sin Stripe ni base de datos.
 */

export const PRO_PLAN_KEY = 'pro';
export const DEFAULT_PRO_PRICE_CENTS = 999;
/** Un curso con menos lecciones publicadas se muestra "en preparación" y no se vende. */
export const MIN_PUBLISHED_LESSONS_TO_SELL = 3;

/**
 * Un curso incluido en PRO o un resto de acompañamiento 1:1 no se vende
 * como compra única: el acceso lo da la suscripción o un alta histórica.
 */
export function isOneOffPurchasableAccessType(accessType: string): boolean {
  return accessType !== 'pro' && accessType !== 'seguimiento';
}

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
  const start = unixToDate(
    sub.current_period_start ?? item?.current_period_start,
  );
  const end = unixToDate(sub.current_period_end ?? item?.current_period_end);
  const scheduledCancel =
    unixToDate(sub.cancel_at) ?? (sub.cancel_at_period_end ? end : null);
  return { start, end, cancelAt: scheduledCancel };
}

/** Importe en céntimos -> decimal con 2 decimales para la columna `amount`. */
export function centsToAmount(cents?: number | null): number | null {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) return null;
  return Math.round(cents) / 100;
}

export function amountToCents(
  amount: string | number | { toString(): string },
) {
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

type StripeLikeError = {
  code?: string;
  param?: string;
  type?: string;
  message?: string;
};

function readStripeError(error: unknown): StripeLikeError {
  if (!error || typeof error !== 'object') return {};
  const record = error as Record<string, unknown>;
  return {
    code: typeof record.code === 'string' ? record.code : undefined,
    param: typeof record.param === 'string' ? record.param : undefined,
    type: typeof record.type === 'string' ? record.type : undefined,
    message: typeof record.message === 'string' ? record.message : undefined,
  };
}

/** Customer ID de test/modo antiguo: Stripe no lo encuentra en live. */
export function isMissingStripeCustomerError(error: unknown): boolean {
  const err = readStripeError(error);
  if (err.code === 'resource_missing' && err.param === 'customer') {
    return true;
  }
  return /no such customer/i.test(err.message || '');
}

/** Stripe Tax no está activado en el Dashboard; automatic_tax rompe el checkout. */
export function isStripeTaxNotEnabledError(error: unknown): boolean {
  const message = readStripeError(error).message || '';
  return /automatic[_\s-]?tax|tax settings|not set up to collect tax/i.test(
    message,
  );
}

/**
 * Mensaje que se puede mostrar al comprador/admin. No incluye secretos.
 * Si Stripe pide activar la cuenta o las tarjetas, lo dice en claro.
 */
export function publicStripeCheckoutMessage(error: unknown): string {
  const err = readStripeError(error);
  const message = err.message || '';
  const code = err.code || '';
  const type = err.type || '';

  if (
    /live charges|cannot currently make live|not fully activated|activate your account|account is not activated/i.test(
      message,
    )
  ) {
    return 'Stripe aún no admite cobros en vivo. En el Dashboard (modo Live) completa la activación de la cuenta: datos del negocio y cuenta bancaria para ingresos.';
  }
  if (
    type === 'StripeAuthenticationError' ||
    /invalid api[- ]key|expired api key/i.test(message) ||
    code === 'api_key_expired'
  ) {
    return 'La clave de Stripe no es válida. En Railway, STRIPE_SECRET_KEY debe ser la de modo Live (sk_live_…) y coincidir con el webhook live.';
  }
  if (
    /payment method type|no valid payment method|must enable at least one payment method/i.test(
      message,
    )
  ) {
    return 'En Stripe Dashboard → Settings → Payment methods, activa “Cards” para EUR.';
  }
  if (/test mode.*live|live mode.*test/i.test(message)) {
    return 'Estás mezclando claves de test y live. Usa sk_live_ y el webhook de live para cobrar de verdad.';
  }
  if (
    message &&
    message.length <= 280 &&
    !/sk_live|sk_test|rk_|whsec_/i.test(message)
  ) {
    return `Stripe rechazó el pago: ${message}`;
  }
  return 'No se pudo iniciar el pago. Inténtalo de nuevo.';
}
