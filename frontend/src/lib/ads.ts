export const adsConfig = {
  enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true',
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
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
  if (!adsConfig.enabled) return false;
  return !excludedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export function shouldRenderAdPlaceholder(pathname: string) {
  if (shouldShowAds(pathname)) return true;
  return process.env.NODE_ENV !== 'production' && !excludedPrefixes.some((prefix) => pathname.startsWith(prefix));
}
