'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { adsConfig, shouldShowAds } from '@/lib/ads';
import { hasGoogleAnalytics, hasMetaPixel, marketingConfig } from '@/lib/marketing';
import { useConsent } from './consent-provider';

const ADSENSE_SCRIPT_ID = 'radar-vpo-adsense';
const META_PIXEL_SCRIPT_ID = 'radar-vpo-meta-pixel';
const GA_SCRIPT_ID = 'radar-vpo-ga-gtag';

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function ensureMetaPixel(pixelId: string) {
  if (typeof window === 'undefined') return;
  if (document.getElementById(META_PIXEL_SCRIPT_ID)) {
    window.fbq?.('track', 'PageView');
    return;
  }

  if (!window.fbq) {
    const n = function (...args: unknown[]) {
      const fn = window.fbq;
      if (!fn) return;
      if (fn.callMethod) fn.callMethod(...args);
      else fn.queue?.push(args);
    } as FbqFn;
    n.queue = [];
    n.loaded = true;
    n.version = '2.0';
    n.push = n;
    window.fbq = n;
    if (!window._fbq) window._fbq = n;
  }

  const script = document.createElement('script');
  script.id = META_PIXEL_SCRIPT_ID;
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq?.('init', pixelId);
  window.fbq?.('track', 'PageView');
}

function ensureGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return;

  if (!window.dataLayer) window.dataLayer = [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  }

  if (!document.getElementById(GA_SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = GA_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: false });
  }

  window.gtag('event', 'page_view', {
    page_path: window.location.pathname + window.location.search,
  });
}

export function ConsentedScripts({
  vercelAnalytics = false,
}: {
  vercelAnalytics?: boolean;
}) {
  const pathname = usePathname();
  const { preferences } = useConsent();
  const adsAllowed = Boolean(preferences?.ads && shouldShowAds(pathname));
  const analyticsAllowed = Boolean(preferences?.analytics);
  const marketingAdsAllowed = Boolean(preferences?.ads);

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

  useEffect(() => {
    if (!analyticsAllowed || !hasGoogleAnalytics()) return;
    ensureGoogleAnalytics(marketingConfig.gaMeasurementId);
  }, [analyticsAllowed, pathname]);

  useEffect(() => {
    if (!marketingAdsAllowed || !hasMetaPixel()) return;
    ensureMetaPixel(marketingConfig.metaPixelId);
  }, [marketingAdsAllowed, pathname]);

  return analyticsAllowed && vercelAnalytics ? <Analytics /> : null;
}
