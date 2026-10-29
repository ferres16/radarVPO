/**
 * Configuración AdSense.
 *
 * Para salir de “Getting ready” Google necesita, como mínimo:
 * 1) /ads.txt válido con el pub-id correcto
 * 2) código/meta de AdSense detectable en páginas públicas
 * 3) unidades reales (no placeholders) en rutas crawlables
 */

/** Normaliza ca-pub-XXX o pub-XXX → pub-XXX */
export function resolveAdsensePublisherId(
  publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
  clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
): string {
  const explicit = publisherId?.trim();
  if (explicit) {
    return explicit.startsWith('ca-') ? explicit.slice(3) : explicit;
  }
  const client = clientId?.trim();
  if (!client) return '';
  if (client.startsWith('ca-pub-')) return client.slice(3);
  if (client.startsWith('pub-')) return client;
  return '';
}

const publisherId = resolveAdsensePublisherId();

/**
 * Fallback alineado con `public/ads.txt`. El middleware/route pisan el estático;
 * sin publisher en env nunca debemos volver a servir “Publicidad desactivada…”.
 */
const FALLBACK_PUBLISHER_ID = 'pub-9530052824706142';

export const adsTxtContent = `google.com, ${publisherId || FALLBACK_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0\n`;

export const adUnitPlacements = {
  sidebar: 'Rail izquierdo en desktop (pantalla >= 1280px), todas las páginas públicas',
  card: 'Rail derecho en desktop (pantalla >= 1280px), todas las páginas públicas',
  inline: 'Bloque horizontal en listados y fichas (promociones, noticias)',
} as const;

export const adsConfig = {
  enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true',
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || '',
  publisherId,
  slots: {
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || '',
    inline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE || '',
    mobileSticky: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_STICKY || '',
    card: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CARD || '',
  },
};

/** Rutas sin anuncios (auth, cobro, cuenta, legales). El catálogo público SÍ puede mostrar ads. */
const excludedPrefixes = [
  '/admin',
  '/account',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/checkout',
  '/payment',
  '/mi-espacio',
  '/aviso-legal',
  '/privacidad',
  '/cookies',
  '/condiciones',
  '/contacto',
];

const placeholderSlotPattern = /^123456789\d$/;

export function isUsableAdSlot(slotId?: string) {
  const id = slotId?.trim();
  if (!id) return false;
  return !placeholderSlotPattern.test(id);
}

function matchesExcludedPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isAdExcludedPath(pathname: string) {
  return excludedPrefixes.some((prefix) => matchesExcludedPath(pathname, prefix));
}

export function shouldShowAds(pathname: string) {
  if (!adsConfig.enabled || !adsConfig.clientId) return false;
  return !isAdExcludedPath(pathname);
}

/** ¿Hay al menos una unidad real configurada? Sin slots Google no ve inventario. */
export function hasConfiguredAdSlots() {
  return Object.values(adsConfig.slots).some((slot) => isUsableAdSlot(slot));
}

export function shouldRenderAdPlaceholder(pathname: string) {
  if (process.env.NODE_ENV === 'production') return false;
  if (!shouldShowAds(pathname)) {
    return false;
  }
  return true;
}
