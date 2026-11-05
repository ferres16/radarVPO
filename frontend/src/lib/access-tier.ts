/**
 * Niveles de acceso (espejo del backend). Mantener alineado con
 * backend/src/common/access-tier.ts y con las tablas comerciales.
 */

export type AccessTier = 'visitor' | 'registered' | 'pro';

export const VISITOR_PROMOTION_LIST_LIMIT = 10;
export const VISITOR_PROMOTION_DETAIL_LIMIT = 2;

export const ACCESS_TIER_LABELS: Record<AccessTier, string> = {
  visitor: 'Sin registro',
  registered: 'Registrado gratis',
  pro: 'Radar VPO PRO',
};

export function isEmailVerified(value?: string | Date | null): boolean {
  return Boolean(value);
}

export function resolveAccessTier(input?: {
  emailVerifiedAt?: string | Date | null;
  plan?: string | null;
  hasProAccess?: boolean;
} | null): AccessTier {
  if (!input || !isEmailVerified(input.emailVerifiedAt)) {
    return 'visitor';
  }
  if (input.hasProAccess || input.plan === 'pro') {
    return 'pro';
  }
  return 'registered';
}
