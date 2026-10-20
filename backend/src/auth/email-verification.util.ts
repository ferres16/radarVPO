import { createHash, randomBytes } from 'crypto';

export const EMAIL_VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
/** Mínimo entre reenvíos por usuario. */
export const EMAIL_VERIFY_RESEND_COOLDOWN_MS = 60 * 1000;
/** Tope de reenvíos por usuario en 24 h. */
export const EMAIL_VERIFY_RESEND_MAX_PER_DAY = 8;

export function createEmailVerificationToken() {
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashEmailVerificationToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashEmailVerificationToken(rawToken: string) {
  return createHash('sha256').update(rawToken).digest('hex');
}
