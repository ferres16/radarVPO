/** Nombre público de la Guía VPO. El producto se gestiona en Radar VPO, no en Stripe. */
export const GUIDE_VPO_PUBLIC_TITLE =
  'Guía para optar a una vivienda protegida en Catalunya';

export const GUIDE_VPO_PUBLIC_DESCRIPTION =
  'Entiende el proceso de la VPO en Catalunya y qué preparar antes del siguiente paso.';

const GUIDE_VPO_SLUGS = new Set([
  'guiav1',
  'guia-vpo',
  'guia-general-vpo',
  'vpo-desde-cero',
  'vpo-inicial',
]);

export function isGuideVpoSlug(slug?: string | null): boolean {
  return Boolean(slug && GUIDE_VPO_SLUGS.has(slug));
}

export function publicCourseProductName(course: {
  slug: string;
  title: string;
}): string {
  return isGuideVpoSlug(course.slug) ? GUIDE_VPO_PUBLIC_TITLE : course.title;
}
