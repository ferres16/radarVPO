import {
  cleanMunicipalityRaw,
  extractMunicipalityFromAlertTitle,
  inferMunicipalityFromText,
  looksLikeStreetOrNoise,
  normalizeMunicipality,
  titleCaseMunicipality,
} from './catalunya-municipalities';

describe('municipality normalization', () => {
  it('maps Montgat and “a Montgat” to the same canonical municipality', () => {
    expect(normalizeMunicipality('Montgat').canonicalId).toBe('montgat');
    expect(normalizeMunicipality('a Montgat').canonicalId).toBe('montgat');
    expect(normalizeMunicipality('a Montgat').canonicalName).toBe('Montgat');
  });

  it('keeps the original raw text for contrast', () => {
    const result = normalizeMunicipality('a Montgat');
    expect(result.raw).toBe('a Montgat');
  });

  it('rejects streets as municipalities', () => {
    expect(looksLikeStreetOrNoise('Carrer de Sant Pere de Ribes')).toBe(true);
    expect(normalizeMunicipality('Carrer de Sant Pere').needsReview).toBe(true);
    expect(normalizeMunicipality('Carrer de Sant Pere').canonicalId).toBeNull();
  });

  it('strips residual numbers and prepositions', () => {
    expect(cleanMunicipalityRaw('a Montgat 12')).toBe('Montgat');
  });

  it('infers Montgat from announcement phrasing', () => {
    const inferred = inferMunicipalityFromText(
      'Promoció d’habitatges al municipi de Montgat. Bases publicades.',
    );
    expect(inferred.canonicalName).toBe('Montgat');
    expect(inferred.needsReview).toBe(false);
  });

  it('finds Arenys de Mar at end of phrasing', () => {
    expect(
      inferMunicipalityFromText('Habitatges a Arenys de Mar').canonicalName,
    ).toBe('Arenys de Mar');
  });

  it('extracts municipalities from official ALERTA titles including ALL CAPS', () => {
    expect(
      extractMunicipalityFromAlertTitle(
        "ALERTA: Propera adjudicació d'habitatge d'HPO de venda promoguts per LANDCOMPANY 2020, SLU a Vilafranca del Penedès",
      ).canonicalName,
    ).toBe('Vilafranca del Penedès');
    expect(
      extractMunicipalityFromAlertTitle(
        "ALERTA: Propera adjudicació d'habitatge d'HPO de venda promoguts per WHITE AND YOU SL a VILALLONGA DEL CAMP",
      ).canonicalName,
    ).toBe('Vilallonga del Camp');
    expect(
      extractMunicipalityFromAlertTitle(
        "ALERTA: Propera adjudicació d'habitatge d'HPO de venda promoguts per TURISSA HABITATGES, SL a TOSSA DE MAR",
      ).canonicalName,
    ).toBe('Tossa de Mar');
  });

  it('title-cases ALL CAPS municipality names', () => {
    expect(titleCaseMunicipality('TOSSA DE MAR')).toBe('Tossa de Mar');
  });
});
