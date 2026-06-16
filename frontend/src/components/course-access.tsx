"use client";

import Link from 'next/link';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '@/lib/api';

type CourseAccessContextValue = {
  canAccess: boolean;
};

const CourseAccessContext = createContext<CourseAccessContextValue>({ canAccess: false });

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

  useEffect(() => {
    let active = true;

    api
      .getCourseForUser(slug)
      .then((course) => {
        if (active) {
          setCanAccess(Boolean(course.access?.canAccess));
        }
      })
      .catch(() => {
        if (active) {
          setCanAccess(Boolean(initialCanAccess));
        }
      });

    return () => {
      active = false;
    };
  }, [initialCanAccess, slug]);

  const value = useMemo(() => ({ canAccess }), [canAccess]);

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
  const { canAccess } = useContext(CourseAccessContext);
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
  const { canAccess } = useContext(CourseAccessContext);
  const lessonHref = `/cursos/${courseSlug}/${lessonSlug}`;
  const href = canAccess ? lessonHref : `/login?next=${encodeURIComponent(lessonHref)}`;

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
