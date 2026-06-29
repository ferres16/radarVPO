'use client';

import type { ReactNode } from 'react';
import { useCourseAccess } from '@/components/course-access';

export function CoursePublicIndex({ children }: { children: ReactNode }) {
  const { canAccess, resolved } = useCourseAccess();

  if (resolved && canAccess) {
    return null;
  }

  return <>{children}</>;
}
