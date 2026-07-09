const defaultClientId = 'ca-pub-9530052824706142';

export const adsConfig = {
  enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== 'false',
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || defaultClientId,
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
  '/checkout',
  '/payment',
  '/cursos/',
];

export function shouldShowAds(pathname: string) {
  if (!adsConfig.enabled || !adsConfig.clientId) return false;
  return !excludedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export function shouldRenderAdPlaceholder(pathname: string) {
  if (!shouldShowAds(pathname)) {
    return process.env.NODE_ENV !== 'production' && !excludedPrefixes.some((prefix) => pathname.startsWith(prefix));
  }

  const hasAnySlot = Object.values(adsConfig.slots).some(Boolean);
  return !hasAnySlot || process.env.NODE_ENV !== 'production';
}
