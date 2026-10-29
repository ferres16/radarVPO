import { describe, expect, it } from 'vitest';
import {
  extractMunicipalityFromAlertTitle,
  resolveAlertMunicipality,
  titleCaseMunicipality,
} from './alert-municipality';

describe('alert municipality extraction', () => {
  it('extracts Vilafranca from a Landcompany alert title', () => {
    const title =
      "ALERTA: Propera adjudicació d'habitatge d'HPO de venda promoguts per LANDCOMPANY 2020, SLU a Vilafranca del Penedès";
    expect(extractMunicipalityFromAlertTitle(title)).toBe('Vilafranca del Penedès');
  });

  it('extracts and title-cases ALL CAPS municipalities', () => {
    expect(
      extractMunicipalityFromAlertTitle(
        "ALERTA: Propera adjudicació d'habitatge d'HPO de venda promoguts per WHITE AND YOU SL a VILALLONGA DEL CAMP",
      ),
    ).toBe('Vilallonga del Camp');
    expect(
      extractMunicipalityFromAlertTitle(
        "ALERTA: Propera adjudicació d'habitatge d'HPO de venda promoguts per TURISSA HABITATGES, SL a TOSSA DE MAR",
      ),
    ).toBe('Tossa de Mar');
  });

  it('falls back to title when municipality field is missing', () => {
    expect(
      resolveAlertMunicipality({
        title:
          "ALERTA: Propera adjudicació d'habitatge d'HPO de venda promoguts per TURISSA HABITATGES, SL a TOSSA DE MAR",
        municipality: null,
      }),
    ).toBe('Tossa de Mar');
  });

  it('title-cases municipality words and keeps small connectors', () => {
    expect(titleCaseMunicipality('VILALLONGA DEL CAMP')).toBe('Vilallonga del Camp');
  });
});
