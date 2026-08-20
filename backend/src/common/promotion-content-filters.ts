/**
 * Shared content filters for scraped / listed promotions and alerts.
 * Amendments ("esmenes") must never enter the product as new publications.
 */

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`´]/g, "'");
}

const AMENDMENT_TOKENS = new Set([
  'esmena',
  'esmenes',
  'correccio',
  'correccion',
  'rectificacio',
  'rectificacion',
  'amendment',
  'amendments',
]);

export function isAmendmentPublication(
  ...parts: Array<string | null | undefined>
): boolean {
  const text = normalizeForMatch(parts.filter(Boolean).join('\n'));
  if (!text) return false;
  return text
    .split(/[^a-z0-9]+/)
    .some((token) => AMENDMENT_TOKENS.has(token));
}

/**
 * Official "new published promotion" announcements from the Registre.
 * Only these should trigger publication emails/SMS (not amendments, alerts, or unrelated posts).
 */
export function isOfficialProcedureStartAnnouncement(
  ...parts: Array<string | null | undefined>
): boolean {
  const text = normalizeForMatch(parts.filter(Boolean).join('\n')).trim();
  if (!text) return false;

  return (
    /^anunci\s+(d['']\s*)?inici(\s+de)?\s+procediment\b/.test(text) ||
    /^anuncio\s+(de\s+)?inicio(\s+de)?\s+procedimiento\b/.test(text) ||
    /^anunci\s+d['']inici\s+de\s+procediment\b/.test(text)
  );
}

/** Prisma-friendly title exclusions for public lists (defense in depth). */
export const AMENDMENT_TITLE_CONTAINS = [
  'esmena',
  'esmenes',
  'corrección',
  'correccio',
  'correcció',
  'rectificación',
  'rectificacio',
  'rectificació',
  'amendment',
] as const;

export function shortenAlertTitle(title: string): string {
  return title
    .replace(
      /\s*En el termini de\s+\d+\s*dies\s+es\s+publicar[àa]\s+l['’]anunci\s+amb\s+els\s+detalls\s+i\s+on\s+es\s+recollir[àa]\s+el\s+procediment\s+d['’]adjudicaci[oó]\.?/gi,
      '',
    )
    .replace(
      /\s*En el plazo de\s+\d+\s*d[ií]as\s+se\s+publicar[áa]\s+el\s+anuncio\s+con\s+los\s+detalles\s+y\s+donde\s+se\s+recoger[áa]\s+el\s+procedimiento\s+de\s+adjudicaci[oó]n\.?/gi,
      '',
    )
    .replace(/\s+/g, ' ')
    .replace(/\s*\.\s*$/, '.')
    .trim();
}
