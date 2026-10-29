import { userMatchesProAlertPreferences } from '../pro-alert-preferences';

describe('userMatchesProAlertPreferences', () => {
  it('allows all promotions when preferences are empty', () => {
    expect(
      userMatchesProAlertPreferences(
        {},
        { municipality: 'Reus', municipalityId: 'reus', promotionType: 'venta' },
      ),
    ).toBe(true);
  });

  it('excludes third municipalities when two are configured', () => {
    const user = { alertMunicipalityIds: ['montgat', 'reus'] };
    expect(
      userMatchesProAlertPreferences(user, {
        municipalityId: 'montgat',
        promotionType: 'alquiler',
      }),
    ).toBe(true);
    expect(
      userMatchesProAlertPreferences(user, {
        municipalityId: 'calafell',
        promotionType: 'alquiler',
      }),
    ).toBe(false);
  });

  it('filters by buy/rent preference', () => {
    const user = { alertPromotionTypes: ['alquiler'] };
    expect(
      userMatchesProAlertPreferences(user, {
        municipalityId: 'montgat',
        promotionType: 'alquiler',
      }),
    ).toBe(true);
    expect(
      userMatchesProAlertPreferences(user, {
        municipalityId: 'montgat',
        promotionType: 'venta',
      }),
    ).toBe(false);
  });
});
