import * as bcrypt from 'bcryptjs';
import { createHash, timingSafeEqual } from 'crypto';

/**
 * Los refresh tokens son JWT de alta entropía: basta SHA-256. bcrypt solo usa
 * los primeros 72 bytes (cabecera + inicio del payload), así que no distinguía
 * entre tokens de la misma sesión y la rotación no invalidaba los anteriores.
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function refreshTokenMatches(
  token: string,
  storedHash: string,
): Promise<boolean> {
  if (storedHash.startsWith('$2')) {
    // Sesiones creadas antes del cambio; se migran a SHA-256 en el siguiente refresh.
    return bcrypt.compare(token, storedHash);
  }
  const expected = Buffer.from(storedHash, 'hex');
  const actual = Buffer.from(hashRefreshToken(token), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
