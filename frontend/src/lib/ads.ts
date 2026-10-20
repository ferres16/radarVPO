export const adsTxtContent = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
  ? `google.com, ${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID.trim()}, DIRECT, f08c47fec0942fa0`
  : '# Publicidad desactivada en el lanzamiento.';

export const adUnitPlacements = {
  sidebar: 'Rail izquierdo en desktop (pantalla >= 1280px), todas las páginas públicas',
  card: 'Rail derecho en desktop (pantalla >= 1280px), todas las páginas públicas',
  inline: 'Bloque horizontal en listados y fichas (promociones, noticias)',
} as const;

export const adsConfig = {
  enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true',
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || '',
  slots: {
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || '',
    inline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE || '',
    mobileSticky: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_STICKY || '',
    card: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CARD || '',
  },
};

const excludedPrefixes = [
  '/admin',
  '/account',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/checkout',
  '/payment',
  '/cursos',
  '/promotions',
  '/mi-espacio',
  '/aviso-legal',
  '/privacidad',
  '/cookies',
  '/condiciones',
  '/contacto',
  '/pro',
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

export function shouldShowAds(pathname: string) {
  if (!adsConfig.enabled || !adsConfig.clientId) return false;
  return !excludedPrefixes.some((prefix) => matchesExcludedPath(pathname, prefix));
}

export function shouldRenderAdPlaceholder(pathname: string) {
  if (process.env.NODE_ENV === 'production') return false;
  if (!shouldShowAds(pathname)) {
    return false;
  }
  return true;
}
