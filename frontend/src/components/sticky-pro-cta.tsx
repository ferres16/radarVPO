'use client';

import Link from 'next/link';
import { proHref, proPlan } from '@/lib/pro';

export function StickyProCta() {
  const external = /^https?:\/\//.test(proHref);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--stroke)] glass-surface p-3 md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">{proPlan.name}</p>
          <p className="truncate text-sm font-black text-[var(--ink)]">{proPlan.price}</p>
        </div>
        {external ? (
          <a
            href={proHref}
            className="shrink-0 rounded-full bg-[var(--green-700)] px-5 py-2.5 text-sm font-black text-white shadow-glow"
            rel="noopener noreferrer"
            target="_blank"
          >
            {proPlan.ctaLabel}
          </a>
        ) : (
          <Link href={proHref} className="shrink-0 rounded-full bg-[var(--green-700)] px-5 py-2.5 text-sm font-black text-white shadow-card">
            {proPlan.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
