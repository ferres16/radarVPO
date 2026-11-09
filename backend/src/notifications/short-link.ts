/**
 * Enlaces cortos para SMS: www.radarvpo.com/p/<código> en lugar de
 * https://www.radarvpo.com/promotions/<cuid> (62 → ~30 caracteres).
 * El código son los últimos caracteres del cuid (parte aleatoria).
 */
export const PROMOTION_SHORT_CODE_LENGTH = 10;
const SHORT_CODE_PATTERN = /^[a-z0-9]{8,16}$/;

export function promotionShortCode(promotionId: string): string {
  return promotionId.slice(-PROMOTION_SHORT_CODE_LENGTH).toLowerCase();
}

export function isValidShortCode(code: string): boolean {
  return SHORT_CODE_PATTERN.test(code);
}

/** Sin "https://": los móviles enlazan igual "www.dominio/ruta" y ahorra 8 caracteres. */
export function smsLink(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function promotionSmsLink(siteUrl: string, promotionId: string): string {
  return smsLink(siteUrl, `/p/${promotionShortCode(promotionId)}`);
}
