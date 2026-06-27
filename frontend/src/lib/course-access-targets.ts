import { proHref, proPlan } from '@/lib/pro';
import type { Course } from '@/types';

export function getFirstLessonSlug(course: Pick<Course, 'modules'>): string | null {
  const modules = course.modules || [];
  const firstLesson = modules.flatMap((module) => module.lessons || [])[0];
  return firstLesson?.slug ?? null;
}

export function getCourseEntryHref(course: Pick<Course, 'slug' | 'modules'>): string {
  const lessonSlug = getFirstLessonSlug(course);
  return lessonSlug
    ? `/cursos/${course.slug}/${lessonSlug}`
    : `/cursos/${course.slug}#indice`;
}

export type CourseAccessTargets = {
  accessHref: string;
  lockedHref: string;
  lockedLabel: string;
  accessLabel: string;
};

export function buildCourseAccessTargets(course: Course): CourseAccessTargets {
  const entryHref = getCourseEntryHref(course);
  const includedInPro = course.accessType === 'pro';
  const isFree = course.pricingType === 'free' || course.accessType === 'free';

  if (includedInPro) {
    return {
      accessHref: entryHref,
      lockedHref: proHref,
      lockedLabel: proPlan.ctaLabel,
      accessLabel: 'Entrar al curso',
    };
  }

  if (course.stripePaymentLink) {
    return {
      accessHref: entryHref,
      lockedHref: course.stripePaymentLink,
      lockedLabel: 'Comprar curso',
      accessLabel: 'Entrar al curso',
    };
  }

  if (isFree) {
    return {
      accessHref: entryHref,
      lockedHref: `/login?next=${encodeURIComponent(entryHref)}`,
      lockedLabel: 'Entrar al curso',
      accessLabel: 'Entrar al curso',
    };
  }

  return {
    accessHref: entryHref,
    lockedHref: `/login?next=${encodeURIComponent(entryHref)}`,
    lockedLabel: 'Solicitar acceso',
    accessLabel: 'Entrar al curso',
  };
}
