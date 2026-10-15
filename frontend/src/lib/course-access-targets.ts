import { formatEuro, getCheckoutHref, getCoursePrice, isCourseFree, isCourseSellable } from '@/lib/offer';
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

export const COURSE_PURCHASE_ANCHOR = '#precio';

/**
 * Destinos de los botones de un curso.
 * - Con acceso: entra al curso.
 * - Sin acceso y a la venta: checkout integrado (pago + activación automática).
 * - Sin acceso y todavía en preparación: no se vende; lleva al programa.
 */
export function buildCourseAccessTargets(course: Course): CourseAccessTargets {
  const lessonSlug = getFirstLessonSlug(course);
  const entryHref = getCourseEntryHref(course);
  const accessLabel = lessonSlug ? 'Continuar curso' : 'Ver índice';
  const base = { accessHref: entryHref, accessLabel, hasLessons: Boolean(lessonSlug) };

  if (isCourseFree(course)) {
    return {
      ...base,
      lockedHref: `/cursos/${course.slug}${COURSE_PURCHASE_ANCHOR}`,
      lockedLabel: 'Acceder al curso',
    };
  }

  if (isCourseSellable(course)) {
    const price = getCoursePrice(course);
    return {
      ...base,
      lockedHref: getCheckoutHref('course', course.slug),
      lockedLabel: price !== null ? `Comprar curso · ${formatEuro(price)}` : 'Comprar curso',
    };
  }

  return {
    ...base,
    lockedHref: `/cursos/${course.slug}#indice`,
    lockedLabel: 'Ver programa',
  };
}
