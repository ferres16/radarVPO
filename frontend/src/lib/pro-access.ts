import type { UserProfile } from '@/types';

export type ProSubscriptionDisplayStatus =
  | 'active'
  | 'inactive'
  | 'cancel_pending'
  | 'canceled'
  | 'expired';

export type ProAccessInfo = {
  hasAccess: boolean;
  status: ProSubscriptionDisplayStatus;
  activatedAt: string | null;
  nextRenewalAt: string | null;
  cancellationRequestedAt: string | null;
  canManageViaStripe: boolean;
  managementMethod: 'stripe_portal' | 'manual_request' | null;
};

export function hasProAccess(profile: UserProfile | null | undefined): boolean {
  return Boolean(profile?.proAccess?.hasAccess);
}

export function getProStatusLabel(status: ProSubscriptionDisplayStatus): string {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'inactive':
      return 'Inactivo';
    case 'cancel_pending':
      return 'Cancelación pendiente';
    case 'canceled':
      return 'Cancelada';
    case 'expired':
      return 'Vencida';
    default:
      return 'Desconocido';
  }
}

export function getProStatusTone(
  status: ProSubscriptionDisplayStatus,
): 'active' | 'warning' | 'locked' | 'neutral' {
  switch (status) {
    case 'active':
      return 'active';
    case 'cancel_pending':
      return 'warning';
    case 'canceled':
    case 'expired':
      return 'locked';
    default:
      return 'neutral';
  }
}

export function splitFullName(fullName?: string | null): {
  firstName: string;
  lastName: string;
} {
  const trimmed = (fullName || '').trim();
  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }
  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
}

export function formatProfileDate(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(
    new Date(value),
  );
}
