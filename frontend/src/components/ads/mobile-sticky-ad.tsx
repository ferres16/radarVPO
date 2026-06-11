'use client';

import { usePathname } from 'next/navigation';
import { shouldRenderAdPlaceholder, shouldShowAds } from '@/lib/ads';
import { AdSlot } from './ad-slot';

export function MobileStickyAd() {
  const pathname = usePathname();

  if (!shouldShowAds(pathname) && !shouldRenderAdPlaceholder(pathname)) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-30 md:hidden">
      <AdSlot
        slot="mobileSticky"
        className="rounded-2xl border border-[var(--stroke)] bg-white/95 p-2 shadow-[0_16px_48px_rgba(30,31,28,0.18)] backdrop-blur"
        minHeight={64}
        label="Publicidad"
      />
    </div>
  );
}
