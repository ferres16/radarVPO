import type { Course } from '@/types';

/**
 * Fuente única de la oferta comercial de Radar VPO.
 *
 * Reglas:
 * - Aquí solo se describe lo que el producto hace HOY. Lo que está en roadmap
 *   vive en docs/estrategia-lanzamiento.md y no se anuncia en la web.
 * - Los precios de los cursos NO están aquí: salen siempre del curso (campo
 *   `price`), que es lo mismo que cobra Stripe. Así web y cobro no pueden divergir.
 * - El precio de PRO debe coincidir con `STRIPE_PRO_PRICE_CENTS` del backend
 *   (por defecto 999 céntimos).
 */

export const PRO_PRICE_AMOUNT = 9.99;
export const PRO_PRICE_INTERVAL_LABEL = 'al mes';

/** Debe coincidir con MIN_PUBLISHED_LESSONS_TO_SELL del backend. */
export const COURSE_MIN_LESSONS_TO_SELL = 3;

export function formatEuro(amount: number, options?: { decimals?: 'auto' | 2 }): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  const forceDecimals = options?.decimals === 2;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: forceDecimals || hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const proPriceLabel = `${formatEuro(PRO_PRICE_AMOUNT, { decimals: 2 })} ${PRO_PRICE_INTERVAL_LABEL}`;

export function countPublishedLessons(course: Pick<Course, 'modules'>): number {
  return (
    course.modules?.reduce(
      (total, module) =>
        total + (module.lessons?.filter((lesson) => lesson.status === 'published').length ?? 0),
      0,
    ) ?? 0
  );
}

export function countModules(course: Pick<Course, 'modules'>): {
  total: number;
  withLessons: number;
} {
  const modules = course.modules ?? [];
  return {
    total: modules.length,
    withLessons: modules.filter((module) => (module.lessons?.length ?? 0) > 0).length,
  };
}

/** Precio final de venta del curso (el mismo que cobra Stripe) o null si no es de pago. */
export function getCoursePrice(course: Pick<Course, 'price' | 'pricingType'>): number | null {
  if (course.pricingType !== 'premium') return null;
  const amount = Number(course.price);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function isCourseFree(course: Pick<Course, 'pricingType' | 'accessType'>): boolean {
  return course.pricingType === 'free' || course.accessType === 'free';
}

export function isIncludedInPro(course: Pick<Course, 'accessType'>): boolean {
  return course.accessType === 'pro';
}

/**
 * Un curso solo se vende cuando tiene precio y un mínimo de lecciones publicadas.
 * Mientras tanto se muestra como "en preparación" con su estado real.
 */
export function isCourseSellable(course: Course): boolean {
  return getCoursePrice(course) !== null && countPublishedLessons(course) >= COURSE_MIN_LESSONS_TO_SELL;
}

export type CourseStatusSummary = {
  publishedLessons: number;
  modulesTotal: number;
  modulesWithLessons: number;
  sellable: boolean;
  /** Texto honesto sobre el estado real del contenido. */
  statusText: string;
};

export function getCourseStatusSummary(course: Course): CourseStatusSummary {
  const publishedLessons = countPublishedLessons(course);
  const { total, withLessons } = countModules(course);
  const sellable = isCourseSellable(course);

  const lessonsText =
    publishedLessons === 1 ? '1 lección publicada' : `${publishedLessons} lecciones publicadas`;
  const modulesText = total > 0 ? ` · ${withLessons} de ${total} módulos con contenido` : '';

  return {
    publishedLessons,
    modulesTotal: total,
    modulesWithLessons: withLessons,
    sellable,
    statusText: `${lessonsText}${modulesText}`,
  };
}

export function getPreviewLessonSlug(course: Pick<Course, 'seoMetadata'>): string | null {
  const value = course.seoMetadata?.previewLessonSlug;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function getCheckoutHref(
  product: 'pro' | 'course',
  courseSlug?: string,
): string {
  if (product === 'pro') return '/checkout?product=pro';
  return `/checkout?product=course&course=${encodeURIComponent(courseSlug ?? '')}`;
}

const LESSON_TYPE_LABELS: Record<string, [string, string]> = {
  video: ['lección en vídeo', 'lecciones en vídeo'],
  text: ['lección de texto', 'lecciones de texto'],
  downloadable: ['recurso descargable', 'recursos descargables'],
  mixed: ['lección mixta', 'lecciones mixtas'],
};

/** Formato del contenido calculado a partir de las lecciones reales. */
export function describeCourseFormat(course: Pick<Course, 'modules'>): string[] {
  const counts = new Map<string, number>();
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      counts.set(lesson.type, (counts.get(lesson.type) ?? 0) + 1);
    }
  }
  return [...counts.entries()].map(([type, count]) => {
    const labels = LESSON_TYPE_LABELS[type];
    if (!labels) return `${count} ${type}`;
    return `${count} ${count === 1 ? labels[0] : labels[1]}`;
  });
}

/**
 * Datos editoriales por curso. Solo texto que describe el producto; nada de
 * cifras, valoraciones ni testimonios. Si un curso no aparece aquí, la página
 * muestra únicamente lo que sale de sus datos reales.
 */
export type CourseEditorial = {
  audience: string[];
};

export const courseEditorial: Record<string, CourseEditorial> = {
  'vpo-inicial': {
    audience: [
      'Personas que nunca han solicitado una vivienda protegida y quieren entender el proceso desde cero.',
      'Quien ya ha mirado alguna promoción pero no tiene claro si cumple los requisitos ni qué papeles hacen falta.',
    ],
  },
  cursoavanzado: {
    audience: [
      'Quien ya entiende el proceso básico y quiere profundizar cuando el programa esté publicado completo.',
    ],
  },
};

/** Autoría verificable: solo se muestra si el titular configura estos datos. */
export function getCourseAuthor(): { name: string; bio: string } | null {
  const name = process.env.NEXT_PUBLIC_COURSE_AUTHOR_NAME?.trim();
  const bio = process.env.NEXT_PUBLIC_COURSE_AUTHOR_BIO?.trim();
  if (!name || !bio) return null;
  return { name, bio };
}

export const COURSE_ACCESS_DURATION_TEXT =
  'Pago único. Sin cuotas de renovación: el acceso se mantiene mientras el curso siga publicado en Radar VPO.';
