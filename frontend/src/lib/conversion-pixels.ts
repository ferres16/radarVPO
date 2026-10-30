/**
 * Eventos de conversión hacia Meta Pixel / GA4 / Google Ads (gtag).
 * Requiere consentimiento previo (analítica y/o publicidad según evento).
 * No envía PII (email, nombre, tokens).
 */

import { marketingConfig } from '@/lib/marketing';

export type ConversionProduct = 'pro' | 'pro_pack_3m' | 'course';

type Money = {
  value: number;
  currency: string;
  transactionId: string;
};

function readConsent(): { analytics: boolean; ads: boolean } {
  if (typeof document === 'undefined') return { analytics: false, ads: false };
  try {
    const match = document.cookie.match(/(?:^|; )rv_consent=([^;]*)/);
    if (!match?.[1]) return { analytics: false, ads: false };
    const parsed = JSON.parse(decodeURIComponent(match[1])) as {
      analytics?: unknown;
      ads?: unknown;
    };
    return {
      analytics: parsed.analytics === true,
      ads: parsed.ads === true,
    };
  } catch {
    return { analytics: false, ads: false };
  }
}

function dedupeKey(event: string, transactionId: string) {
  return `rv_conv_${event}_${transactionId}`;
}

function alreadySent(event: string, transactionId: string) {
  if (typeof window === 'undefined') return true;
  try {
    return window.sessionStorage.getItem(dedupeKey(event, transactionId)) === '1';
  } catch {
    return false;
  }
}

function markSent(event: string, transactionId: string) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(dedupeKey(event, transactionId), '1');
  } catch {
    // ignore
  }
}

function contentIds(product: ConversionProduct, courseSlug?: string | null) {
  if (product === 'course') return [courseSlug ? `course:${courseSlug}` : 'course'];
  if (product === 'pro_pack_3m') return ['pro_pack_3m'];
  return ['pro'];
}

/** begin_checkout / InitiateCheckout — al iniciar Stripe (tras consentimiento aplicable). */
export function trackBeginCheckout(input: {
  product: ConversionProduct;
  courseSlug?: string | null;
  value?: number;
  currency?: string;
}) {
  const consent = readConsent();
  const ids = contentIds(input.product, input.courseSlug);
  if (consent.ads && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: ids,
      content_type: 'product',
      value: input.value,
      currency: (input.currency || 'EUR').toUpperCase(),
    });
  }
  if (consent.analytics && window.gtag && marketingConfig.gaMeasurementId) {
    window.gtag('event', 'begin_checkout', {
      currency: (input.currency || 'EUR').toUpperCase(),
      value: input.value,
      items: ids.map((id) => ({ item_id: id })),
    });
  }
}

/** Compra confirmada (pago validado en servidor). Deduplicada por transactionId. */
export function trackPurchaseConversion(input: {
  product: ConversionProduct;
  courseSlug?: string | null;
  money: Money;
}) {
  const { transactionId } = input.money;
  if (!transactionId || alreadySent('purchase', transactionId)) return;
  const consent = readConsent();
  const ids = contentIds(input.product, input.courseSlug);
  const value =
    Number.isFinite(input.money.value) && input.money.value >= 0
      ? input.money.value
      : 0;
  const currency = (input.money.currency || 'EUR').toUpperCase();

  if (consent.ads && window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: ids,
      content_type: 'product',
      value,
      currency,
      // Meta dedupe con eventID si se configura CAPI más adelante
    });
  }

  if (consent.analytics && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items: ids.map((id) => ({ item_id: id, quantity: 1 })),
    });

    const adsId = marketingConfig.googleAdsId;
    const label = marketingConfig.googleAdsPurchaseLabel;
    if (adsId && label) {
      window.gtag('event', 'conversion', {
        send_to: `${adsId}/${label}`,
        value,
        currency,
        transaction_id: transactionId,
      });
    }
  }

  markSent('purchase', transactionId);
}

export function trackCompleteRegistration() {
  const consent = readConsent();
  if (consent.ads && window.fbq) {
    window.fbq('track', 'CompleteRegistration');
  }
  if (consent.analytics && window.gtag) {
    window.gtag('event', 'sign_up', { method: 'email' });
  }
}
