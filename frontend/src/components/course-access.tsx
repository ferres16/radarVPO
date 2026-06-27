"use client";

import Link from 'next/link';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '@/lib/api';
import type { CourseAccessType, CoursePricingType } from '@/types';

type CourseAccessContextValue = {
  canAccess: boolean;
  resolved: boolean;
  initialCanAccess: boolean;
};

const CourseAccessContext = createContext<CourseAccessContextValue>({
  canAccess: false,
  resolved: false,
  initialCanAccess: false,
});

export function CourseAccessProvider({
  slug,
  accessType,
  pricingType,
  initialCanAccess = false,
  children,
}: {
  slug: string;
  accessType: CourseAccessType;
  pricingType?: CoursePricingType;
  initialCanAccess?: boolean;
  children: ReactNode;
}) {
  const [canAccess, setCanAccess] = useState(initialCanAccess);
  const [resolved, setResolved] = useState(initialCanAccess);

  useEffect(() => {
    let active = true;

    if (initialCanAccess) {
      setCanAccess(true);
      setResolved(true);
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        const course = await api.getCourseForUser(slug);
        if (!active) return;
        setCanAccess(Boolean(course.access?.canAccess));
        setResolved(true);
        return;
      } catch {
        // Continue with fallbacks below.
      }

      try {
        const [me, courses] = await Promise.all([
          api.getMe(),
          api.listCoursesForUser(),
        ]);
        if (!active) return;

        const match = courses.find((course) => course.slug === slug);
        if (match?.access?.canAccess) {
          setCanAccess(true);
        } else if (accessType === 'pro' && me.plan === 'pro') {
          setCanAccess(true);
        } else if (accessType === 'free' || pricingType === 'free') {
          setCanAccess(true);
        } else {
          setCanAccess(false);
        }
        setResolved(true);
        return;
      } catch {
        if (!active) return;
        setCanAccess(false);
        setResolved(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [accessType, initialCanAccess, pricingType, slug]);

  const value = useMemo(
    () => ({ canAccess, resolved, initialCanAccess }),
    [canAccess, initialCanAccess, resolved],
  );

  return <CourseAccessContext.Provider value={value}>{children}</CourseAccessContext.Provider>;
}

function pickHref(canAccess: boolean, hrefWhenAccess: string, hrefWhenLocked: string) {
  return canAccess ? hrefWhenAccess : hrefWhenLocked;
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
  const { canAccess, resolved, initialCanAccess } = useContext(CourseAccessContext);
  const hasAccess = resolved ? canAccess : initialCanAccess;
  const href = pickHref(hasAccess, hrefWhenAccess, hrefWhenLocked);
  const label = hasAccess ? accessLabel : lockedLabel;

  if (/^https?:\/\//.test(href)) {
    return (
      <a
        href={href}
        className={className}
        rel="noopener noreferrer"
        target="_blank"
        aria-busy={!resolved}
      >
        {!resolved ? 'Entrar al curso' : label}
      </a>
    );
  }

  return (
    <Link href={href} className={className} aria-busy={!resolved}>
      {!resolved ? 'Entrar al curso' : label}
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
  const { canAccess, resolved, initialCanAccess } = useContext(CourseAccessContext);
  const lessonHref = `/cursos/${courseSlug}/${lessonSlug}`;
  const hasAccess = resolved ? canAccess : initialCanAccess;
  const href = hasAccess ? lessonHref : `/login?next=${encodeURIComponent(lessonHref)}`;

  return (
    <Link href={href} className={className} aria-busy={!resolved}>
      {children}
    </Link>
  );
}
