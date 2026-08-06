import { isAmendmentPublication } from '../promotion-content-filters';

describe('isAmendmentPublication', () => {
  it('detects Catalan esmena titles', () => {
    expect(
      isAmendmentPublication(
        "Esmena de l'anunci d'adjudicació d'habitatges a Barcelona",
      ),
    ).toBe(true);
    expect(isAmendmentPublication("Publicacio d'esmenes al registre")).toBe(
      true,
    );
  });

  it('detects correction / rectification wording', () => {
    expect(isAmendmentPublication('Corrección del anuncio oficial')).toBe(true);
    expect(isAmendmentPublication('Rectificació de la convocatòria')).toBe(
      true,
    );
  });

  it('allows normal announcements and alerts', () => {
    expect(
      isAmendmentPublication(
        "ALERTA: Propera adjudicació d'habitatges d'HPO a Arenys de Mar",
      ),
    ).toBe(false);
    expect(
      isAmendmentPublication(
        'Anunci de convocatòria per a la adjudicació de habitatges',
      ),
    ).toBe(false);
  });
});
