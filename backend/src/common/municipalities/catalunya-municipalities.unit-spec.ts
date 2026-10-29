import {
  cleanMunicipalityRaw,
  inferMunicipalityFromText,
  looksLikeStreetOrNoise,
  normalizeMunicipality,
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

  it('finds Reus and Arenys de Mar in free text', () => {
    expect(
      inferMunicipalityFromText('Nova convocatòria a Reus per a lloguer').canonicalName,
    ).toBe('Reus');
    expect(
      inferMunicipalityFromText('Habitatges a Arenys de Mar').canonicalName,
    ).toBe('Arenys de Mar');
  });
});
