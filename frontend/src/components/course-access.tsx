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
    let timer: number | undefined;

    if (initialCanAccess || isFree) {
      setCanAccess(true);
      setResolved(true);
      return () => {
        active = false;
      };
    }

    const justPaid =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('checkout') === 'success';

    async function checkAccess() {
      try {
        const course = await api.getCourseForUser(slug);
        if (!active) return false;
        const ok = Boolean(course.access?.canAccess);
        setCanAccess(ok);
        return ok;
      } catch {
        if (!active) return false;
        setCanAccess(false);
        return false;
      }
    }

    if (!justPaid) {
      void checkAccess().finally(() => {
        if (active) setResolved(true);
      });
      return () => {
        active = false;
      };
    }

    let attempts = 0;
    const poll = async () => {
      const ok = await checkAccess();
      attempts += 1;
      if (ok || attempts >= 8) {
        if (timer) window.clearInterval(timer);
        if (active) setResolved(true);
      }
    };
    void poll();
    timer = window.setInterval(() => {
      void poll();
    }, 2500);

    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
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

export function useHasCourseAccess() {
  const { canAccess, resolved, initialCanAccess } = useCourseAccess();
  return resolved ? canAccess : initialCanAccess;
}

export function AccessSwitch({
  fallback,
  children,
}: {
  fallback: ReactNode;
  children: ReactNode;
}) {
  return useHasCourseAccess() ? children : fallback;
}

export function LockedOnly({ children }: { children: ReactNode }) {
  return useHasCourseAccess() ? null : children;
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
  const content = label;

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
  isPreview = false,
}: {
  courseSlug: string;
  lessonSlug: string;
  className: string;
  children: ReactNode;
  /** Lección de muestra: visible sin comprar el curso. */
  isPreview?: boolean;
}) {
  const { canAccess, resolved, initialCanAccess } = useCourseAccess();
  const hasAccess = resolved ? canAccess : initialCanAccess;

  if (!hasAccess && !isPreview) {
    return (
      <span
        className={`${className} cursor-not-allowed opacity-70`}
        aria-disabled="true"
        title="Disponible al comprar el curso"
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
