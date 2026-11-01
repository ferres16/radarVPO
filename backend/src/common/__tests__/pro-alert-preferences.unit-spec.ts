import { userMatchesProAlertPreferences } from '../pro-alert-preferences';

describe('userMatchesProAlertPreferences', () => {
  it('always matches regardless of stored municipality or type prefs', () => {
    expect(
      userMatchesProAlertPreferences(
        { alertMunicipalityIds: ['montgat'], alertPromotionTypes: ['alquiler'] },
        {
          municipalityId: 'calafell',
          promotionType: 'venta',
        },
      ),
    ).toBe(true);
    expect(
      userMatchesProAlertPreferences(
        {},
        { municipality: 'Reus', municipalityId: 'reus', promotionType: 'venta' },
      ),
    ).toBe(true);
  });
});
