'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { adsConfig, isUsableAdSlot, shouldRenderAdPlaceholder, shouldShowAds } from '@/lib/ads';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotProps = {
  slot: keyof typeof adsConfig.slots;
  className?: string;
  format?: string;
  minHeight?: number;
  label?: string;
};

export function AdSlot({
  slot,
  className = '',
  format = 'auto',
  minHeight = 120,
  label = 'Publicidad',
}: AdSlotProps) {
  const pathname = usePathname();
  const slotId = adsConfig.slots[slot];
  const canShowRealAd = Boolean(shouldShowAds(pathname) && adsConfig.clientId && isUsableAdSlot(slotId));
  const canShowPlaceholder = shouldRenderAdPlaceholder(pathname);

  useEffect(() => {
    if (!canShowRealAd) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ad blockers can throw here; the slot should fail closed without breaking UI.
    }
  }, [canShowRealAd, pathname, slotId]);

  if (!canShowRealAd && !canShowPlaceholder) {
    return null;
  }

  if (!canShowRealAd) {
    return (
      <aside
        className={`rounded-2xl border border-dashed border-[var(--stroke)] bg-white/70 p-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)] ${className}`}
        style={{ minHeight }}
        aria-label={label}
      >
        {label}
        <p className="mt-2 normal-case tracking-normal">Placeholder AdSense</p>
      </aside>
    );
  }

  return (
    <aside className={className} aria-label={label}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight }}
        data-ad-client={adsConfig.clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
