/**
 * Catálogo canónico (espejo operativo del backend) para filtros públicos.
 * Solo equivalencias seguras; el texto original se conserva en municipalityRaw.
 */

export type CanonicalMunicipality = {
  id: string;
  name: string;
  aliases: string[];
};

export const CATALUNYA_MUNICIPALITIES: CanonicalMunicipality[] = [
  { id: 'barcelona', name: 'Barcelona', aliases: ['bcn'] },
  { id: 'montgat', name: 'Montgat', aliases: ['a montgat'] },
  { id: 'reus', name: 'Reus', aliases: [] },
  { id: 'arenys-de-mar', name: 'Arenys de Mar', aliases: ['arenys'] },
  { id: 'sant-pere-de-ribes', name: 'Sant Pere de Ribes', aliases: ['sant pere ribes'] },
  { id: 'calafell', name: 'Calafell', aliases: [] },
  { id: 'terrassa', name: 'Terrassa', aliases: ['tarrasa'] },
  { id: 'sabadell', name: 'Sabadell', aliases: [] },
  { id: 'mataro', name: 'Mataró', aliases: ['mataro'] },
  { id: 'girona', name: 'Girona', aliases: ['gerona'] },
  { id: 'sant-cugat-del-valles', name: 'Sant Cugat del Vallès', aliases: ['sant cugat', 'sant cugat del valles'] },
  { id: 'rubi', name: 'Rubí', aliases: ['rubi'] },
  { id: 'vilafranca-del-penedes', name: 'Vilafranca del Penedès', aliases: ['vilafranca', 'vilafranca del penedes'] },
  { id: 'vilallonga-del-camp', name: 'Vilallonga del Camp', aliases: ['vilallonga', 'vilallonga del camp'] },
  { id: 'vilanova-i-la-geltru', name: 'Vilanova i la Geltrú', aliases: ['vilanova', 'vilanova i la geltru'] },
  { id: 'tossa-de-mar', name: 'Tossa de Mar', aliases: ['tossa'] },
  { id: 'badalona', name: 'Badalona', aliases: [] },
  { id: 'lleida', name: 'Lleida', aliases: ['lerida'] },
  { id: 'tarragona', name: 'Tarragona', aliases: [] },
];

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function cleanMunicipalityRaw(raw: string): string {
  return raw
    .replace(/\d+/g, ' ')
    .replace(/^(a|al|als|de|del|dels|d'|l'|el|la|les|los|en)\s+/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^[-:;,.\s]+|[-:;,.\s]+$/g, '')
    .trim();
}

function normalizeKey(value: string) {
  return stripDiacritics(cleanMunicipalityRaw(value))
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const LOOKUP = (() => {
  const map = new Map<string, CanonicalMunicipality>();
  for (const item of CATALUNYA_MUNICIPALITIES) {
    map.set(normalizeKey(item.name), item);
    for (const alias of item.aliases) map.set(normalizeKey(alias), item);
  }
  return map;
})();

export function resolveMunicipalityId(
  municipality?: string | null,
  municipalityId?: string | null,
): string | null {
  if (municipalityId?.trim()) return municipalityId.trim();
  if (!municipality?.trim()) return null;
  return LOOKUP.get(normalizeKey(municipality))?.id ?? null;
}

export function resolveMunicipalityLabel(
  municipality?: string | null,
  municipalityId?: string | null,
): string {
  if (municipalityId) {
    const known = CATALUNYA_MUNICIPALITIES.find((item) => item.id === municipalityId);
    if (known) return known.name;
  }
  if (!municipality?.trim()) return '';
  const known = LOOKUP.get(normalizeKey(municipality));
  return known?.name || cleanMunicipalityRaw(municipality);
}

export function municipalitiesMatch(
  left?: string | null,
  right?: string | null,
  leftId?: string | null,
  rightId?: string | null,
): boolean {
  const a = resolveMunicipalityId(left, leftId);
  const b = resolveMunicipalityId(right, rightId);
  if (a && b) return a === b;
  return resolveMunicipalityLabel(left, leftId) === resolveMunicipalityLabel(right, rightId);
}
