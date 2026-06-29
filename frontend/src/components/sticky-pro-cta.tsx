'use client';

import Link from 'next/link';
import { proHref, proPlan } from '@/lib/pro';

export function StickyProCta() {
  const external = /^https?:\/\//.test(proHref);

  return (
    <div className="sticky-pro-cta md:hidden">
      <div className="sticky-pro-cta__inner">
        <div className="min-w-0">
          <p className="sticky-pro-cta__label">{proPlan.name}</p>
          <p className="sticky-pro-cta__price">{proPlan.price}</p>
        </div>
        {external ? (
          <a href={proHref} className="btn btn--primary btn--lg shrink-0" rel="noopener noreferrer" target="_blank">
            {proPlan.ctaLabel}
          </a>
        ) : (
          <Link href={proHref} className="btn btn--primary btn--lg shrink-0">
            {proPlan.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
