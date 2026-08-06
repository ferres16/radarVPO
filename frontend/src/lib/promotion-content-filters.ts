/**
 * Client/server filter for amendment ("esmena") publications.
 * Keep in sync with backend/src/common/promotion-content-filters.ts
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
