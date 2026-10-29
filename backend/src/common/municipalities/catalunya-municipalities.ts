/**
 * Catálogo canónico de municipios de Catalunya para normalización segura.
 * Solo equivalencias evidentes; lo ambiguo queda en revisión.
 */

export type CanonicalMunicipality = {
  id: string;
  name: string;
  aliases: string[];
};

/** Subconjunto operativo + aliases observados en scraping (preposiciones, sin acento). */
export const CATALUNYA_MUNICIPALITIES: CanonicalMunicipality[] = [
  { id: 'barcelona', name: 'Barcelona', aliases: ['bcn'] },
  { id: 'hospitalet-de-llobregat', name: "L'Hospitalet de Llobregat", aliases: ['hospitalet', "l'hospitalet", 'l hospitalet de llobregat'] },
  { id: 'badalona', name: 'Badalona', aliases: [] },
  { id: 'terrassa', name: 'Terrassa', aliases: ['tarrasa'] },
  { id: 'sabadell', name: 'Sabadell', aliases: [] },
  { id: 'lleida', name: 'Lleida', aliases: ['lerida'] },
  { id: 'tarragona', name: 'Tarragona', aliases: [] },
  { id: 'mataro', name: 'Mataró', aliases: ['mataro'] },
  { id: 'santa-coloma-de-gramenet', name: 'Santa Coloma de Gramenet', aliases: ['santa coloma'] },
  { id: 'reus', name: 'Reus', aliases: [] },
  { id: 'girona', name: 'Girona', aliases: ['gerona'] },
  { id: 'sant-cugat-del-valles', name: 'Sant Cugat del Vallès', aliases: ['sant cugat', 'sant cugat del valles'] },
  { id: 'cornella-de-llobregat', name: 'Cornellà de Llobregat', aliases: ['cornella', 'cornella de llobregat'] },
  { id: 'sant-boi-de-llobregat', name: 'Sant Boi de Llobregat', aliases: ['sant boi'] },
  { id: 'rubi', name: 'Rubí', aliases: ['rubi'] },
  { id: 'manresa', name: 'Manresa', aliases: [] },
  { id: 'vilanova-i-la-geltru', name: 'Vilanova i la Geltrú', aliases: ['vilanova', 'vilanova i la geltru'] },
  { id: 'viladecans', name: 'Viladecans', aliases: [] },
  { id: 'castelldefels', name: 'Castelldefels', aliases: [] },
  { id: 'el-prat-de-llobregat', name: 'El Prat de Llobregat', aliases: ['el prat', 'prat de llobregat'] },
  { id: 'granollers', name: 'Granollers', aliases: [] },
  { id: 'cerdanyola-del-valles', name: 'Cerdanyola del Vallès', aliases: ['cerdanyola', 'cerdanyola del valles'] },
  { id: 'mollet-del-valles', name: 'Mollet del Vallès', aliases: ['mollet', 'mollet del valles'] },
  { id: 'sant-feliu-de-llobregat', name: 'Sant Feliu de Llobregat', aliases: ['sant feliu'] },
  { id: 'igualada', name: 'Igualada', aliases: [] },
  { id: 'vic', name: 'Vic', aliases: [] },
  { id: 'blanes', name: 'Blanes', aliases: [] },
  { id: 'vilafranca-del-penedes', name: 'Vilafranca del Penedès', aliases: ['vilafranca', 'vilafranca del penedes'] },
  { id: 'figueres', name: 'Figueres', aliases: ['figueras'] },
  { id: 'lloret-de-mar', name: 'Lloret de Mar', aliases: ['lloret'] },
  { id: 'martorell', name: 'Martorell', aliases: [] },
  { id: 'sitges', name: 'Sitges', aliases: [] },
  { id: 'montgat', name: 'Montgat', aliases: ['a montgat'] },
  { id: 'arenys-de-mar', name: 'Arenys de Mar', aliases: ['arenys'] },
  { id: 'sant-pere-de-ribes', name: 'Sant Pere de Ribes', aliases: ['sant pere ribes'] },
  { id: 'calafell', name: 'Calafell', aliases: [] },
  { id: 'vendrell', name: 'El Vendrell', aliases: ['vendrell', 'el vendrell'] },
  { id: 'sant-andreu-de-la-barca', name: 'Sant Andreu de la Barca', aliases: [] },
  { id: 'sant-vicenc-dels-horts', name: "Sant Vicenç dels Horts", aliases: ['sant vicenc dels horts', 'sant vicenç dels horts'] },
  { id: 'esparreguera', name: 'Esparreguera', aliases: ['esparraguera'] },
  { id: 'olesa-de-montserrat', name: 'Olesa de Montserrat', aliases: ['olesa'] },
  { id: 'premia-de-mar', name: 'Premià de Mar', aliases: ['premia de mar', 'premia'] },
  { id: 'el-masnou', name: 'El Masnou', aliases: ['masnou'] },
  { id: 'pineda-de-mar', name: 'Pineda de Mar', aliases: ['pineda'] },
  { id: 'malgrat-de-mar', name: 'Malgrat de Mar', aliases: ['malgrat'] },
  { id: 'tossa-de-mar', name: 'Tossa de Mar', aliases: ['tossa'] },
  { id: 'palamos', name: 'Palamós', aliases: ['palamos'] },
  { id: 'sant-feliu-de-guixols', name: 'Sant Feliu de Guíxols', aliases: ['sant feliu de guixols'] },
  { id: 'olot', name: 'Olot', aliases: [] },
  { id: 'banyoles', name: 'Banyoles', aliases: [] },
  { id: 'ripoll', name: 'Ripoll', aliases: [] },
  { id: 'puigcerda', name: 'Puigcerdà', aliases: ['puigcerda'] },
  { id: 'tremp', name: 'Tremp', aliases: [] },
  { id: 'seu-durgell', name: "La Seu d'Urgell", aliases: ["la seu d'urgell", 'seu durgell', 'la seu'] },
  { id: 'balaguer', name: 'Balaguer', aliases: [] },
  { id: 'tarrega', name: 'Tàrrega', aliases: ['tarrega', 'tàrrega'] },
  { id: 'amposta', name: 'Amposta', aliases: [] },
  { id: 'tortosa', name: 'Tortosa', aliases: [] },
  { id: 'cambrils', name: 'Cambrils', aliases: [] },
  { id: 'salou', name: 'Salou', aliases: [] },
  { id: 'torredembarra', name: 'Torredembarra', aliases: [] },
  { id: 'cunit', name: 'Cunit', aliases: [] },
  { id: 'cubelles', name: 'Cubelles', aliases: [] },
  { id: 'garraf', name: 'Garraf', aliases: [] },
  { id: 'sant-pol-de-mar', name: 'Sant Pol de Mar', aliases: ['sant pol'] },
  { id: 'canet-de-mar', name: 'Canet de Mar', aliases: ['canet'] },
  { id: 'calella', name: 'Calella', aliases: [] },
  { id: 'sant-celoni', name: 'Sant Celoni', aliases: [] },
  { id: 'cardedeu', name: 'Cardedeu', aliases: [] },
  { id: 'la-roca-del-valles', name: 'La Roca del Vallès', aliases: ['la roca', 'roca del valles'] },
  { id: 'montcada-i-reixac', name: 'Montcada i Reixac', aliases: ['montcada'] },
  { id: 'ripolet', name: 'Ripollet', aliases: [] },
  { id: 'barbera-del-valles', name: 'Barberà del Vallès', aliases: ['barbera', 'barbera del valles'] },
  { id: 'sant-quirze-del-valles', name: 'Sant Quirze del Vallès', aliases: ['sant quirze'] },
  { id: 'castellar-del-valles', name: 'Castellar del Vallès', aliases: ['castellar'] },
  { id: 'sentmenat', name: 'Sentmenat', aliases: [] },
  { id: 'palau-solita-i-plegamans', name: 'Palau-solità i Plegamans', aliases: ['palau solita'] },
  { id: 'santa-perpetua-de-mogoda', name: 'Santa Perpètua de Mogoda', aliases: ['santa perpetua'] },
  { id: 'molins-de-rei', name: 'Molins de Rei', aliases: ['molins'] },
  { id: 'sant-joan-despi', name: 'Sant Joan Despí', aliases: ['sant joandespi', 'sant joan despi'] },
  { id: 'sant-just-desvern', name: 'Sant Just Desvern', aliases: ['sant just'] },
  { id: 'esplugues-de-llobregat', name: 'Esplugues de Llobregat', aliases: ['esplugues'] },
  { id: 'sant-adria-de-besos', name: 'Sant Adrià de Besòs', aliases: ['sant adria', 'sant adrià de besòs'] },
];

export type MunicipalityNormalization = {
  raw: string;
  canonicalId: string | null;
  canonicalName: string | null;
  needsReview: boolean;
  reason?: string;
};

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Limpia preposiciones, números sueltos y basura residual del scraper. */
export function cleanMunicipalityRaw(raw: string): string {
  return raw
    .replace(/\d+/g, ' ')
    .replace(
      /^(a|al|als|de|del|dels|d'|l'|el|la|les|los|en)\s+/gi,
      '',
    )
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
    map.set(normalizeKey(item.id.replace(/-/g, ' ')), item);
    for (const alias of item.aliases) {
      map.set(normalizeKey(alias), item);
    }
  }
  return map;
})();

/** Detecta calles/direcciones o residuos que no deben clasificarse como municipio. */
export function looksLikeStreetOrNoise(value: string): boolean {
  const text = value.toLowerCase().trim();
  return (
    /\b(carrer|calle|avinguda|avda|plaza|plaça|passeig|camino|camí|número|num\.|c\/|s\/n)\b/.test(
      text,
    ) ||
    /^(vigor|termini|dies|días|anunci|plazo|detalls|procediment|adjudicacio|adjudicación)$/i.test(
      text,
    ) ||
    /\d{2,}/.test(text) ||
    text.length > 60 ||
    text.length < 2
  );
}

/**
 * Normaliza solo equivalencias seguras del catálogo.
 * Conserva el texto original en `raw` para contraste.
 */
export function normalizeMunicipality(
  rawInput: string | null | undefined,
): MunicipalityNormalization {
  const raw = (rawInput || '').trim();
  if (!raw) {
    return { raw: '', canonicalId: null, canonicalName: null, needsReview: true, reason: 'empty' };
  }

  if (looksLikeStreetOrNoise(raw)) {
    return {
      raw,
      canonicalId: null,
      canonicalName: null,
      needsReview: true,
      reason: 'street_or_noise',
    };
  }

  const cleaned = cleanMunicipalityRaw(raw);
  const key = normalizeKey(cleaned);
  const exact = LOOKUP.get(key);
  if (exact) {
    return {
      raw,
      canonicalId: exact.id,
      canonicalName: exact.name,
      needsReview: false,
    };
  }

  // Coincidencia por contención solo si el catálogo aparece como token completo.
  for (const item of CATALUNYA_MUNICIPALITIES) {
    const nameKey = normalizeKey(item.name);
    if (nameKey.length >= 4 && (key === nameKey || key.endsWith(` ${nameKey}`) || key.startsWith(`${nameKey} `))) {
      return {
        raw,
        canonicalId: item.id,
        canonicalName: item.name,
        needsReview: false,
      };
    }
    for (const alias of item.aliases) {
      const aliasKey = normalizeKey(alias);
      if (aliasKey.length >= 4 && key === aliasKey) {
        return {
          raw,
          canonicalId: item.id,
          canonicalName: item.name,
          needsReview: false,
        };
      }
    }
  }

  return {
    raw,
    canonicalId: null,
    canonicalName: cleaned || raw,
    needsReview: true,
    reason: 'unknown_municipality',
  };
}

/** Extrae el mejor candidato municipal desde un bloque de texto (título + cuerpo). */
export function inferMunicipalityFromText(text: string): MunicipalityNormalization {
  const patterns = [
    /al\s+municipi\s+d(?:e|')\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\s-]{2,60})/i,
    /al\s+municipio\s+de\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\s-]{2,60})/i,
    /\ben\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\s-]{2,40})(?:[.,\n]|$)/i,
    /\ba\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\s-]{2,40})(?:[.,\n]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match?.[1]?.trim();
    if (!value || /catalunya|cataluña|termini|dies|anunci|plazo|días/i.test(value)) {
      continue;
    }
    const normalized = normalizeMunicipality(value);
    if (normalized.canonicalId || !normalized.needsReview) {
      return normalized;
    }
    if (normalized.canonicalName && !looksLikeStreetOrNoise(normalized.canonicalName)) {
      return normalized;
    }
  }

  // Búsqueda directa de nombres canónicos en el texto.
  const haystack = normalizeKey(text);
  for (const item of CATALUNYA_MUNICIPALITIES) {
    const nameKey = normalizeKey(item.name);
    if (nameKey.length >= 4 && haystack.includes(nameKey)) {
      return {
        raw: item.name,
        canonicalId: item.id,
        canonicalName: item.name,
        needsReview: false,
      };
    }
  }

  return {
    raw: '',
    canonicalId: null,
    canonicalName: null,
    needsReview: true,
    reason: 'not_found',
  };
}
