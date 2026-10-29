/**
 * Comprueba si un borrador de noticia está respaldado por el texto de la fuente.
 * No sustituye la revisión humana: solo evita publicaciones claramente desalineadas.
 */

const NON_CATALONIA_MARKERS = [
  'castilla y leon',
  'castilla y león',
  'castilla-la mancha',
  'comunidad de madrid',
  'comunidad valenciana',
  'andalucia',
  'andalucía',
  'galicia',
  'pais vasco',
  'país vasco',
  'euskadi',
  'extremadura',
  'murcia',
  'navarra',
  'la rioja',
  'aragon',
  'aragón',
  'asturias',
  'cantabria',
];

const CATALONIA_MARKERS = [
  'catalunya',
  'cataluña',
  'barcelona',
  'girona',
  'lleida',
  'tarragona',
  'generalitat',
  'incasol',
  'habitatge',
  'ajuntament',
];

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export type SourceGroundingInput = {
  sourceTitle: string;
  sourceSnippet: string;
  sourceContent: string;
  draftTitle: string;
  draftSummary: string;
  draftBody: string;
  draftMunicipality?: string | null;
};

export type SourceGroundingResult = {
  ok: boolean;
  reasons: string[];
};

function extractPercents(text: string) {
  return Array.from(text.matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)).map((match) =>
    match[1].replace(',', '.'),
  );
}

function extractYears(text: string) {
  return Array.from(text.matchAll(/\b(20\d{2})\b/g)).map((match) => match[1]);
}

/**
 * Reglas seguras:
 * - la fuente debe tener contexto de Catalunya o no afirmar otro territorio
 * - cifras % del borrador deben aparecer en la fuente
 * - no publicar si el borrador habla de Catalunya y la fuente de otra CCAA
 */
export function assessNewsSourceGrounding(
  input: SourceGroundingInput,
): SourceGroundingResult {
  const source = normalize(
    `${input.sourceTitle}\n${input.sourceSnippet}\n${input.sourceContent}`,
  );
  const draft = normalize(
    `${input.draftTitle}\n${input.draftSummary}\n${input.draftBody}\n${input.draftMunicipality || ''}`,
  );
  const reasons: string[] = [];

  if (!source.trim() || source.trim().length < 40) {
    reasons.push('source_too_short');
  }

  const sourceHasCatalonia = CATALONIA_MARKERS.some((marker) =>
    source.includes(normalize(marker)),
  );
  const sourceHasOtherRegion = NON_CATALONIA_MARKERS.some((marker) =>
    source.includes(normalize(marker)),
  );
  const draftClaimsCatalonia = CATALONIA_MARKERS.some((marker) =>
    draft.includes(normalize(marker)),
  );

  if (sourceHasOtherRegion && !sourceHasCatalonia) {
    reasons.push('source_outside_catalonia');
  }

  if (draftClaimsCatalonia && sourceHasOtherRegion && !sourceHasCatalonia) {
    reasons.push('territory_mismatch');
  }

  if (draftClaimsCatalonia && !sourceHasCatalonia) {
    reasons.push('catalonia_not_in_source');
  }

  const draftPercents = extractPercents(draft);
  for (const value of draftPercents) {
    if (!source.includes(value) && !source.includes(value.replace('.', ','))) {
      reasons.push(`unsupported_percent:${value}`);
    }
  }

  const draftYears = extractYears(draft);
  const sourceYears = new Set(extractYears(source));
  for (const year of draftYears) {
    // Permitir el año actual del sistema en redacción; exigir los años citados como dato.
    if (!sourceYears.has(year) && Number(year) < new Date().getFullYear()) {
      reasons.push(`unsupported_year:${year}`);
    }
  }

  // Titular de la fuente debe compartir alguna palabra significativa con el borrador
  // o el enlace debe tratarse como sospechoso de asociación errónea.
  const sourceTokens = new Set(
    normalize(input.sourceTitle)
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 4),
  );
  const draftTokens = normalize(input.draftTitle)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 4);
  const overlap = draftTokens.filter((token) => sourceTokens.has(token));
  if (sourceTokens.size >= 3 && overlap.length === 0) {
    reasons.push('title_overlap_missing');
  }

  return {
    ok: reasons.length === 0,
    reasons,
  };
}
