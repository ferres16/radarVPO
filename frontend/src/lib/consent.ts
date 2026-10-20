/**
 * Preferencias de cookies no necesarias.
 * Las cookies de sesión (access_token, refresh_token, session_id) son técnicas
 * y no requieren este consentimiento.
 *
 * Conservación: 13 meses, alineado con la guía de cookies de la AEPD.
 */
export const CONSENT_COOKIE = 'rv_consent';
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_SECONDS = 13 * 30 * 24 * 60 * 60;

export type ConsentPreferences = {
  v: number;
  analytics: boolean;
  ads: boolean;
};

export const DENIED_CONSENT: ConsentPreferences = {
  v: CONSENT_VERSION,
  analytics: false,
  ads: false,
};

export const ACCEPTED_CONSENT: ConsentPreferences = {
  v: CONSENT_VERSION,
  analytics: true,
  ads: true,
};

export function parseConsent(raw: string | null | undefined): ConsentPreferences | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    if (parsed?.v !== CONSENT_VERSION) return null;
    return {
      v: CONSENT_VERSION,
      analytics: parsed.analytics === true,
      ads: parsed.ads === true,
    };
  } catch {
    return null;
  }
}

export function serializeConsent(prefs: ConsentPreferences): string {
  return JSON.stringify({
    v: CONSENT_VERSION,
    analytics: Boolean(prefs.analytics),
    ads: Boolean(prefs.ads),
  });
}

export function readConsentCookie(): ConsentPreferences | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  if (!match?.[1]) return null;
  try {
    return parseConsent(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();

function emitConsentChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeConsent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function writeConsentCookie(prefs: ConsentPreferences) {
  if (typeof document === 'undefined') return;
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(serializeConsent(prefs))}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`;
  emitConsentChange();
}
