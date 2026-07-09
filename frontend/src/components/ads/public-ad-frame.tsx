'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { adsConfig, isUsableAdSlot, shouldShowAds } from '@/lib/ads';
import { AdSlot } from './ad-slot';

export function PublicAdFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showAds = shouldShowAds(pathname);
  const showSidebar = showAds && isUsableAdSlot(adsConfig.slots.sidebar);
  const showCard = showAds && isUsableAdSlot(adsConfig.slots.card);

  if (!showSidebar && !showCard) {
    return <>{children}</>;
  }

  return (
    <div className="public-ad-frame">
      {showSidebar ? (
        <aside className="public-ad-frame__rail public-ad-frame__rail--left" aria-label="Publicidad lateral izquierda">
          <AdSlot slot="sidebar" minHeight={250} label="Publicidad" format="vertical" />
        </aside>
      ) : null}

      <div className="public-ad-frame__main">{children}</div>

      {showCard ? (
        <aside className="public-ad-frame__rail public-ad-frame__rail--right" aria-label="Publicidad lateral derecha">
          <AdSlot slot="card" minHeight={250} label="Publicidad" format="vertical" />
        </aside>
      ) : null}
    </div>
  );
}
