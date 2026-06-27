import { proHref, proPlan } from '@/lib/pro';
import { isSafeExternalCheckoutUrl } from '@/lib/checkout-url';
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
  hasLessons: boolean;
};

export function buildCourseAccessTargets(course: Course): CourseAccessTargets {
  const lessonSlug = getFirstLessonSlug(course);
  const entryHref = getCourseEntryHref(course);
  const includedInPro = course.accessType === 'pro';
  const isFree = course.pricingType === 'free' || course.accessType === 'free';
  const loginFallback = `/login?next=${encodeURIComponent(entryHref)}`;

  if (includedInPro) {
    return {
      accessHref: entryHref,
      lockedHref: proHref,
      lockedLabel: proPlan.ctaLabel,
      accessLabel: lessonSlug ? 'Entrar al curso' : 'Ver índice',
      hasLessons: Boolean(lessonSlug),
    };
  }

  if (course.stripePaymentLink && isSafeExternalCheckoutUrl(course.stripePaymentLink)) {
    return {
      accessHref: entryHref,
      lockedHref: course.stripePaymentLink,
      lockedLabel: 'Comprar curso',
      accessLabel: lessonSlug ? 'Entrar al curso' : 'Ver índice',
      hasLessons: Boolean(lessonSlug),
    };
  }

  if (isFree) {
    return {
      accessHref: entryHref,
      lockedHref: loginFallback,
      lockedLabel: lessonSlug ? 'Entrar al curso' : 'Ver índice',
      accessLabel: lessonSlug ? 'Entrar al curso' : 'Ver índice',
      hasLessons: Boolean(lessonSlug),
    };
  }

  return {
    accessHref: entryHref,
    lockedHref: loginFallback,
    lockedLabel: 'Solicitar acceso',
    accessLabel: lessonSlug ? 'Entrar al curso' : 'Ver índice',
    hasLessons: Boolean(lessonSlug),
  };
}
