import { calendarDaysUntil, madridYmd } from '../pro-notify.util';

describe('pro notify calendar helpers', () => {
  it('formats Madrid calendar dates', () => {
    expect(madridYmd(new Date('2026-08-18T22:30:00.000Z'))).toBe('2026-08-19');
  });

  it('counts whole days until publication', () => {
    const now = new Date('2026-08-18T10:00:00.000+02:00');
    expect(calendarDaysUntil(new Date('2026-08-25T00:00:00.000+02:00'), now)).toBe(
      7,
    );
    expect(calendarDaysUntil(new Date('2026-08-19T00:00:00.000+02:00'), now)).toBe(
      1,
    );
  });
});
