'use client';

import Link from 'next/link';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '@/lib/api';
import { isSafeExternalCheckoutUrl } from '@/lib/checkout-url';
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
  const isFree = accessType === 'free' || pricingType === 'free';
  const [canAccess, setCanAccess] = useState(initialCanAccess || isFree);
  const [resolved, setResolved] = useState(initialCanAccess || isFree);

  useEffect(() => {
    let active = true;

    if (initialCanAccess || isFree) {
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
      } catch {
        if (!active) return;
        setCanAccess(false);
      } finally {
        if (active) setResolved(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [accessType, initialCanAccess, isFree, pricingType, slug]);

  const value = useMemo(
    () => ({ canAccess, resolved, initialCanAccess }),
    [canAccess, initialCanAccess, resolved],
  );

  return <CourseAccessContext.Provider value={value}>{children}</CourseAccessContext.Provider>;
}

export function useCourseAccess() {
  return useContext(CourseAccessContext);
}

function pickHref(canAccess: boolean, hrefWhenAccess: string, hrefWhenLocked: string) {
  return canAccess ? hrefWhenAccess : hrefWhenLocked;
}

function resolveExternalHref(href: string) {
  return isSafeExternalCheckoutUrl(href) ? href : null;
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
  const { canAccess, resolved, initialCanAccess } = useCourseAccess();
  const hasAccess = resolved ? canAccess : initialCanAccess;
  const rawHref = pickHref(hasAccess, hrefWhenAccess, hrefWhenLocked);
  const label = hasAccess ? accessLabel : lockedLabel;
  const content = !resolved ? 'Entrar al curso' : label;

  if (/^https?:\/\//.test(rawHref)) {
    const externalHref = resolveExternalHref(rawHref);
    if (externalHref) {
      return (
        <a
          href={externalHref}
          className={className}
          rel="noopener noreferrer"
          target="_blank"
          aria-busy={!resolved}
        >
          {content}
        </a>
      );
    }
  }

  if (rawHref.startsWith('#')) {
    return (
      <a href={rawHref} className={className} aria-busy={!resolved}>
        {content}
      </a>
    );
  }

  return (
    <Link href={rawHref} className={className} aria-busy={!resolved}>
      {content}
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
  const { canAccess, resolved, initialCanAccess } = useCourseAccess();
  const hasAccess = resolved ? canAccess : initialCanAccess;

  if (!hasAccess) {
    return (
      <span
        className={`${className} cursor-not-allowed opacity-70`}
        aria-disabled="true"
        title="Activa el curso para acceder a esta lección"
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={`/cursos/${courseSlug}/${lessonSlug}`} className={className} aria-busy={!resolved}>
      {children}
    </Link>
  );
}
