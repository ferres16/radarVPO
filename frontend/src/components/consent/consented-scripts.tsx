'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { adsConfig, shouldShowAds } from '@/lib/ads';
import { useConsent } from './consent-provider';

const ADSENSE_SCRIPT_ID = 'radar-vpo-adsense';

export function ConsentedScripts({
  vercelAnalytics = false,
}: {
  vercelAnalytics?: boolean;
}) {
  const pathname = usePathname();
  const { preferences } = useConsent();
  const adsAllowed = Boolean(preferences?.ads && shouldShowAds(pathname));
  const analyticsAllowed = Boolean(preferences?.analytics && vercelAnalytics);

  useEffect(() => {
    if (!adsAllowed || !adsConfig.clientId) return;
    // Ya puede estar en <head> vía AdsenseSiteVerification (detección sin cookie).
    if (document.getElementById(ADSENSE_SCRIPT_ID)) return;
    if (document.querySelector('script[src*="adsbygoogle.js"]')) return;
    const script = document.createElement('script');
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.clientId}`;
    document.head.appendChild(script);
  }, [adsAllowed]);

  return analyticsAllowed ? <Analytics /> : null;
}
