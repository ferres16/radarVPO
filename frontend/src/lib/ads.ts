const defaultClientId = 'ca-pub-9530052824706142';
const defaultPublisherId = 'pub-9530052824706142';

export const adsTxtContent = `google.com, ${defaultPublisherId}, DIRECT, f08c47fec0942fa0`;

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

const placeholderSlotPattern = /^123456789\d$/;

export function isUsableAdSlot(slotId?: string) {
  const id = slotId?.trim();
  if (!id) return false;
  return !placeholderSlotPattern.test(id);
}

export function shouldShowAds(pathname: string) {
  if (!adsConfig.enabled || !adsConfig.clientId) return false;
  return !excludedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export function shouldRenderAdPlaceholder(pathname: string) {
  if (process.env.NODE_ENV === 'production') return false;
  if (!shouldShowAds(pathname)) {
    return !excludedPrefixes.some((prefix) => pathname.startsWith(prefix));
  }
  return true;
}
