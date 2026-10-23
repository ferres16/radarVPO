import {
  isAlertCancellationNotice,
  isAmendmentPublication,
  isOfficialProcedureStartAnnouncement,
  isProperaAdjudicacioAlert,
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

describe('isProperaAdjudicacioAlert', () => {
  it('accepts only ALERTA: Propera adjudicació titles', () => {
    expect(
      isProperaAdjudicacioAlert(
        "ALERTA: Propera adjudicació d'habitatges d'HPO a Arenys de Mar",
      ),
    ).toBe(true);
    expect(
      isProperaAdjudicacioAlert(
        'alerta: propera adjudicacio habitatges Barcelona',
      ),
    ).toBe(true);
  });

  it('rejects AVÍS cancellations and unrelated titles', () => {
    expect(isProperaAdjudicacioAlert("AVÍS: Anul·lació de l'alerta")).toBe(
      false,
    );
    expect(
      isProperaAdjudicacioAlert("Anunci d'inici de procediment d'adjudicació"),
    ).toBe(false);
    expect(isProperaAdjudicacioAlert('Alerta genérica del registre')).toBe(
      false,
    );
  });
});

describe('isAlertCancellationNotice', () => {
  it('detects AVÍS de anulación de alerta', () => {
    expect(isAlertCancellationNotice("AVÍS: Anul·lació de l'alerta")).toBe(
      true,
    );
    expect(
      isAlertCancellationNotice("Avís: Anul·lació de l'alerta de Girona"),
    ).toBe(true);
    expect(
      isAlertCancellationNotice(
        'AVÍS: Anul·lació de l\u2019alerta del procediment d\u2019adjudicació dels habitatges a Mataró',
      ),
    ).toBe(true);
  });

  it('allows real launch alerts', () => {
    expect(
      isAlertCancellationNotice(
        "ALERTA: Propera adjudicació d'habitatges d'HPO",
      ),
    ).toBe(false);
  });
});
