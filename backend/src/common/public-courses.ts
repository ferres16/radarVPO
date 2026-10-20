function normalizeCatalogText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** Productos de prueba o internos: no se venden ni se listan en el catálogo público. */
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
