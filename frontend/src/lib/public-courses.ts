import { isCourseSellable, isGuidePdf } from '@/lib/offer';
import type { Course } from '@/types';

function normalizeCatalogText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** Productos de prueba o internos: no se venden ni se prometen en el catálogo público. */
export function isInternalCatalogCourse(course: {
  title?: string | null;
  slug?: string | null;
}): boolean {
  const title = normalizeCatalogText(course.title ?? '');
  const slug = normalizeCatalogText(course.slug ?? '');
  if (!title && !slug) return false;
  return (
    /^(test|prueba|demo)\b/.test(title) ||
    /\b(test|prueba)\s+(guia|curso|guide)\b/.test(title) ||
    /(^|-)(test|prueba|demo)(-|$)/.test(slug)
  );
}

export function publicCatalogCourses(courses: readonly Course[]): Course[] {
  return courses.filter((course) => !isInternalCatalogCourse(course));
}

export function pickFeaturedPublicCourse(courses: readonly Course[]): Course | null {
  const visible = publicCatalogCourses(courses).sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title),
  );
  return (
    visible.find((course) => isGuidePdf(course) && isCourseSellable(course)) ||
    visible.find(isCourseSellable) ||
    visible[0] ||
    null
  );
}
