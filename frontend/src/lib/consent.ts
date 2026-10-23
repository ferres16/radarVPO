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

/**
 * useSyncExternalStore exige la misma referencia si el valor no ha cambiado.
 * parseConsent() crea un objeto nuevo en cada lectura; sin caché React 19 entra
 * en bucle infinito en cuanto existe la cookie (justo al aceptar).
 */
let snapshotToken = '';
let snapshot: ConsentPreferences | null = null;

function readRawCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  return match?.[1] ?? null;
}

function readRawStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(CONSENT_COOKIE);
  } catch {
    return null;
  }
}

export function readConsentCookie(): ConsentPreferences | null {
  if (typeof document === 'undefined') return null;
  const cookieRaw = readRawCookie();
  const storageRaw = cookieRaw ? null : readRawStorage();
  const token = `c:${cookieRaw ?? ''}|s:${storageRaw ?? ''}`;
  if (token === snapshotToken) return snapshot;

  snapshotToken = token;
  const raw = cookieRaw ?? storageRaw;
  if (!raw) {
    snapshot = null;
    return snapshot;
  }
  try {
    snapshot = parseConsent(cookieRaw ? decodeURIComponent(cookieRaw) : raw);
  } catch {
    snapshot = null;
  }
  return snapshot;
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
  const serialized = serializeConsent(prefs);
  const encoded = encodeURIComponent(serialized);
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${encoded}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  try {
    window.localStorage.setItem(CONSENT_COOKIE, serialized);
  } catch {
    // Safari privado u origen opaco: la cookie de primera parte sigue siendo la fuente.
  }
  snapshotToken = `c:${encoded}|s:`;
  snapshot = {
    v: CONSENT_VERSION,
    analytics: Boolean(prefs.analytics),
    ads: Boolean(prefs.ads),
  };
  emitConsentChange();
}
