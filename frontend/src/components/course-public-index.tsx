'use client';

import { useContext, type ReactNode } from 'react';
import { CourseAccessContext } from '@/components/course-access';

export function CoursePublicIndex({ children }: { children: ReactNode }) {
  const { canAccess, resolved } = useContext(CourseAccessContext);

  if (resolved && canAccess) {
    return null;
  }

  return <>{children}</>;
}
