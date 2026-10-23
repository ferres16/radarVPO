/**
 * Normalización de municipios catalanes para listados y filtros.
 * Conserva el valor original aparte (municipalityOriginal) para trazabilidad.
 */

const ALIASES: Record<string, string> = {
  'a montgat': 'Montgat',
  montgat: 'Montgat',
  'a vilafranca': 'Vilafranca del Penedès',
  'vilafranca del penedes': 'Vilafranca del Penedès',
  'vilafranca del penedès': 'Vilafranca del Penedès',
  'sant cugat': 'Sant Cugat del Vallès',
  'sant cugat del valles': 'Sant Cugat del Vallès',
  'sant cugat del vallès': 'Sant Cugat del Vallès',
  barcelona: 'Barcelona',
  girona: 'Girona',
  lleida: 'Lleida',
  tarragona: 'Tarragona',
  terrassa: 'Terrassa',
  sabadell: 'Sabadell',
  'santa susanna': 'Santa Susanna',
  gironella: 'Gironella',
  calafell: 'Calafell',
  'el prat de llobregat': 'El Prat de Llobregat',
  'prat de llobregat': 'El Prat de Llobregat',
};

const LEADING_PREP = /^(?:a|al|als|en|de|d'|del|la|el|les|els)\s+/i;

function foldKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Quita restos de frase ("a Montgat") sin borrar topónimos oficiales tipo "El Prat…". */
function stripLeadingPrep(value: string): string {
  const trimmed = value.trim();
  if (/^(el|la|les|els)\s+/i.test(trimmed) && !/^a\s+/i.test(trimmed)) {
    return trimmed;
  }
  return trimmed.replace(LEADING_PREP, '').trim();
}

export function canonicalizeMunicipality(
  raw?: string | null,
): string | null {
  if (!raw) return null;
  const cleaned = stripLeadingPrep(raw.replace(/[.,;:]+$/g, '').trim());
  if (!cleaned) return null;

  // Evitar calles / direcciones como municipio.
  if (/\d/.test(cleaned) || /\b(carrer|calle|avinguda|av\.|c\/)\b/i.test(cleaned)) {
    return null;
  }
  if (cleaned.length > 60) return null;

  const key = foldKey(cleaned);
  if (ALIASES[key]) return ALIASES[key];

  // Capitaliza de forma estable sin inventar topónimos.
  return cleaned
    .split(/\s+/)
    .map((part) => {
      if (/^(i|de|d'|del|la|el|les|els)$/i.test(part)) {
        return part.toLowerCase().replace(/^d'/i, "d'");
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

export function municipalitiesMatch(
  a?: string | null,
  b?: string | null,
): boolean {
  const left = canonicalizeMunicipality(a);
  const right = canonicalizeMunicipality(b);
  if (!left || !right) return false;
  return foldKey(left) === foldKey(right);
}
