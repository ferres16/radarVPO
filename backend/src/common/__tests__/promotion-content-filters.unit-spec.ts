import {
  isAmendmentPublication,
  isOfficialProcedureStartAnnouncement,
} from '../promotion-content-filters';

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

describe('isOfficialProcedureStartAnnouncement', () => {
  it('matches Anunci inici procediment titles', () => {
    expect(
      isOfficialProcedureStartAnnouncement(
        "Anunci d'inici de procediment d'adjudicació d'habitatges a Vic",
      ),
    ).toBe(true);
    expect(
      isOfficialProcedureStartAnnouncement(
        'Anunci inici procediment habitatges HPO Barcelona',
      ),
    ).toBe(true);
    expect(
      isOfficialProcedureStartAnnouncement(
        'Anuncio de inicio de procedimiento de adjudicación',
      ),
    ).toBe(true);
  });

  it('rejects amendments, alerts and unrelated titles', () => {
    expect(
      isOfficialProcedureStartAnnouncement(
        "Esmena de l'anunci d'inici de procediment",
      ),
    ).toBe(false);
    expect(
      isOfficialProcedureStartAnnouncement(
        "ALERTA: Propera adjudicació d'habitatges",
      ),
    ).toBe(false);
    expect(
      isOfficialProcedureStartAnnouncement(
        'Convocatòria per a la adjudicació de habitatges',
      ),
    ).toBe(false);
  });
});
