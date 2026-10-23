import { createHash, randomBytes } from 'crypto';

export const PASSWORD_RESET_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function createPasswordResetToken() {
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashPasswordResetToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashPasswordResetToken(rawToken: string) {
  return createHash('sha256').update(rawToken).digest('hex');
}

export function getPasswordResetCooldownRemainingMs(
  lastRequestedAt: Date,
  now = new Date(),
) {
  const elapsed = now.getTime() - lastRequestedAt.getTime();
  return Math.max(0, PASSWORD_RESET_COOLDOWN_MS - elapsed);
}
