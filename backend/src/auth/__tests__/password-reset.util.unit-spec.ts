import {
  createPasswordResetToken,
  getPasswordResetCooldownRemainingMs,
  hashPasswordResetToken,
  PASSWORD_RESET_COOLDOWN_MS,
} from '../password-reset.util';

describe('password reset helpers', () => {
  it('hashes tokens deterministically for lookup', () => {
    const { rawToken, tokenHash } = createPasswordResetToken();
    expect(rawToken).toHaveLength(64);
    expect(tokenHash).toBe(hashPasswordResetToken(rawToken));
  });

  it('computes remaining cooldown time', () => {
    const now = new Date('2026-08-19T12:00:00.000Z');
    const lastRequestedAt = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    expect(getPasswordResetCooldownRemainingMs(lastRequestedAt, now)).toBe(
      PASSWORD_RESET_COOLDOWN_MS - 6 * 60 * 60 * 1000,
    );
  });
});
