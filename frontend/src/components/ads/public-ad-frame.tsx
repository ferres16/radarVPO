'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { shouldRenderAdPlaceholder, shouldShowAds } from '@/lib/ads';
import { AdSlot } from './ad-slot';

export function PublicAdFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showAds = shouldShowAds(pathname);
  const showPlaceholder = shouldRenderAdPlaceholder(pathname);

  if (!showAds && !showPlaceholder) {
    return <>{children}</>;
  }

  return (
    <div className="public-ad-frame">
      <aside className="public-ad-frame__rail public-ad-frame__rail--left" aria-label="Publicidad lateral izquierda">
        <AdSlot slot="sidebar" minHeight={600} label="Publicidad" format="vertical" />
      </aside>

      <div className="public-ad-frame__main">
        <div className="public-ad-frame__mobile-banner md:hidden">
          <AdSlot slot="inline" minHeight={100} label="Publicidad" format="horizontal" />
        </div>
        {children}
      </div>

      <aside className="public-ad-frame__rail public-ad-frame__rail--right" aria-label="Publicidad lateral derecha">
        <AdSlot slot="card" minHeight={600} label="Publicidad" format="vertical" />
      </aside>
    </div>
  );
}
