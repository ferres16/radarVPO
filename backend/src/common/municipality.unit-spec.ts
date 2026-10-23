import {
  canonicalizeMunicipality,
  municipalitiesMatch,
} from './municipality';

describe('canonicalizeMunicipality', () => {
  it('folds Montgat variants used in scraped titles', () => {
    expect(canonicalizeMunicipality('Montgat')).toBe('Montgat');
    expect(canonicalizeMunicipality('a Montgat')).toBe('Montgat');
    expect(canonicalizeMunicipality('A Montgat.')).toBe('Montgat');
  });

  it('keeps official articles like El Prat and rejects street-like values', () => {
    expect(canonicalizeMunicipality('El Prat de Llobregat')).toBe(
      'El Prat de Llobregat',
    );
    expect(canonicalizeMunicipality('Carrer Major 12')).toBeNull();
  });

  it('matches filter selections across aliases', () => {
    expect(municipalitiesMatch('a Montgat', 'Montgat')).toBe(true);
    expect(municipalitiesMatch('Barcelona', 'Girona')).toBe(false);
  });
});
