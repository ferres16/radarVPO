import { describe, expect, it } from 'vitest';
import {
  cleanMunicipalityRaw,
  municipalitiesMatch,
  resolveMunicipalityId,
  resolveMunicipalityLabel,
} from './municipalities';

describe('municipalities', () => {
  it('treats Montgat and a Montgat as the same municipality', () => {
    expect(resolveMunicipalityId('Montgat')).toBe('montgat');
    expect(resolveMunicipalityId('a Montgat')).toBe('montgat');
    expect(municipalitiesMatch('Montgat', 'a Montgat')).toBe(true);
    expect(resolveMunicipalityLabel('a Montgat')).toBe('Montgat');
  });

  it('cleans residual numbers', () => {
    expect(cleanMunicipalityRaw('a Montgat 3')).toBe('Montgat');
  });
});
