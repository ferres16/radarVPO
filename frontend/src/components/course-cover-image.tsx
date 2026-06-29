'use client';

import { useState } from 'react';
import { getCourseCoverSrc } from '@/lib/course-media-url';

type CourseCoverImageProps = {
  slug?: string;
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  label?: string;
};

export function CourseCoverImage({
  slug,
  src,
  alt = '',
  className = 'h-full w-full object-cover',
  fallbackClassName = 'flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--bg-ink-soft)] via-[#1e2a3d] to-[var(--ink)] text-sm font-semibold text-white/70',
  label = 'Radar VPO',
}: CourseCoverImageProps) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = slug ? getCourseCoverSrc(slug, src) : src;

  if (!resolvedSrc || failed) {
    return (
      <div className={fallbackClassName}>
        <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
          {label}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resolvedSrc} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}
