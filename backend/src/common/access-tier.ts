/**
 * Niveles de acceso públicos de Radar VPO.
 * - visitor: anónimo o cuenta sin email verificado
 * - registered: email verificado, plan free
 * - pro: email verificado + suscripción/plan PRO activo
 */

export type AccessTier = 'visitor' | 'registered' | 'pro';

/** Listado máximo de promociones para visitantes. */
export const VISITOR_PROMOTION_LIST_LIMIT = 10;

/** Detalle completo (PDF/docs) solo de las N últimas publicadas para visitantes. */
export const VISITOR_PROMOTION_DETAIL_LIMIT = 2;

export function isEmailVerified(value?: Date | string | null): boolean {
  return Boolean(value);
}

export function resolveAccessTier(
  input?: {
    emailVerifiedAt?: Date | string | null;
    plan?: string | null;
    hasActiveProSubscription?: boolean;
  } | null,
): AccessTier {
  if (!input || !isEmailVerified(input.emailVerifiedAt)) {
    return 'visitor';
  }
  if (input.plan === 'pro' || input.hasActiveProSubscription) {
    return 'pro';
  }
  return 'registered';
}

export function canUseRegisteredBenefits(tier: AccessTier): boolean {
  return tier === 'registered' || tier === 'pro';
}

export function canUseProBenefits(tier: AccessTier): boolean {
  return tier === 'pro';
}
