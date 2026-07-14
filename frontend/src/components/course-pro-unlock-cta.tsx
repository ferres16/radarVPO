'use client';

import { ProCta, ProCtaLink } from '@/components/pro/pro-cta';

export function CourseProUnlockCta({
  className,
  block = false,
}: {
  className?: string;
  block?: boolean;
}) {
  return <ProCta variant="secondary" className={className} block={block} />;
}

export function CourseLessonProLink({ className }: { className?: string }) {
  return <ProCtaLink className={className} />;
}
