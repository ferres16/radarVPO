import {
  formatEuro,
  getCheckoutHref,
  getCoursePrice,
  isCourseFree,
  isCourseSellable,
  isGuidePdf,
} from '@/lib/offer';
import type { Course } from '@/types';

export function getFirstLessonSlug(course: Pick<Course, 'modules'>): string | null {
  const modules = course.modules || [];
  const firstLesson = modules.flatMap((module) => module.lessons || [])[0];
  return firstLesson?.slug ?? null;
}

export function getCourseEntryHref(course: Pick<Course, 'slug' | 'modules' | 'format'>): string {
  if (isGuidePdf(course)) {
    return `/cursos/${course.slug}#guia`;
  }
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
 * - Con acceso: entra al curso / abre la guía.
 * - Sin acceso y a la venta: checkout integrado (pago + activación automática).
 * - Sin acceso y todavía en preparación: no se vende; lleva al programa.
 */
export function buildCourseAccessTargets(course: Course): CourseAccessTargets {
  if (isGuidePdf(course)) {
    const entryHref = `/cursos/${course.slug}#guia`;
    if (isCourseFree(course)) {
      return {
        accessHref: entryHref,
        accessLabel: 'Consultar guía',
        hasLessons: false,
        lockedHref: `/cursos/${course.slug}${COURSE_PURCHASE_ANCHOR}`,
        lockedLabel: 'Acceder a la guía',
      };
    }
    if (isCourseSellable(course)) {
      const price = getCoursePrice(course);
      return {
        accessHref: entryHref,
        accessLabel: 'Consultar guía',
        hasLessons: false,
        lockedHref: getCheckoutHref('course', course.slug),
        lockedLabel: price !== null ? `Comprar guía · ${formatEuro(price)}` : 'Comprar guía',
      };
    }
    return {
      accessHref: entryHref,
      accessLabel: 'Ver guía',
      hasLessons: false,
      lockedHref: entryHref,
      lockedLabel: 'Ver guía',
    };
  }

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
