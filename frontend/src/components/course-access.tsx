"use client";

import Link from 'next/link';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '@/lib/api';

type CourseAccessContextValue = {
  canAccess: boolean;
  resolved: boolean;
};

const CourseAccessContext = createContext<CourseAccessContextValue>({
  canAccess: false,
  resolved: false,
});

export function CourseAccessProvider({
  slug,
  initialCanAccess,
  children,
}: {
  slug: string;
  initialCanAccess?: boolean;
  children: ReactNode;
}) {
  const [canAccess, setCanAccess] = useState(Boolean(initialCanAccess));
  const [resolved, setResolved] = useState(Boolean(initialCanAccess));

  useEffect(() => {
    let active = true;

    api
      .getCourseForUser(slug)
      .then((course) => {
        if (active) {
          setCanAccess(Boolean(course.access?.canAccess));
          setResolved(true);
        }
      })
      .catch(() => {
        if (active) {
          setCanAccess(Boolean(initialCanAccess));
          setResolved(true);
        }
      });

    return () => {
      active = false;
    };
  }, [initialCanAccess, slug]);

  const value = useMemo(() => ({ canAccess, resolved }), [canAccess, resolved]);

  return <CourseAccessContext.Provider value={value}>{children}</CourseAccessContext.Provider>;
}

export function CourseAccessLink({
  hrefWhenLocked,
  hrefWhenAccess,
  lockedLabel,
  accessLabel = 'Entrar al curso',
  className,
}: {
  hrefWhenLocked: string;
  hrefWhenAccess: string;
  lockedLabel: string;
  accessLabel?: string;
  className: string;
}) {
  const { canAccess, resolved } = useContext(CourseAccessContext);

  if (!resolved) {
    return (
      <span className={`${className} pointer-events-none opacity-60`} aria-busy="true">
        Comprobando acceso...
      </span>
    );
  }

  const href = canAccess ? hrefWhenAccess : hrefWhenLocked;
  const label = canAccess ? accessLabel : lockedLabel;

  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={className} rel="noopener noreferrer" target="_blank">
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function CourseLessonAccessLink({
  courseSlug,
  lessonSlug,
  className,
  children,
}: {
  courseSlug: string;
  lessonSlug: string;
  className: string;
  children: ReactNode;
}) {
  const { canAccess, resolved } = useContext(CourseAccessContext);
  const lessonHref = `/cursos/${courseSlug}/${lessonSlug}`;
  const href = canAccess ? lessonHref : `/login?next=${encodeURIComponent(lessonHref)}`;

  if (!resolved) {
    return (
      <span className={`${className} pointer-events-none opacity-60`} aria-busy="true">
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
