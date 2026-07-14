export type ProSubscriptionDisplayStatus =
  | 'active'
  | 'inactive'
  | 'cancel_pending'
  | 'canceled'
  | 'expired';

export type ProAccessSnapshot = {
  hasAccess: boolean;
  status: ProSubscriptionDisplayStatus;
  activatedAt: string | null;
  nextRenewalAt: string | null;
  cancellationRequestedAt: string | null;
  canManageViaStripe: boolean;
  managementMethod: 'stripe_portal' | 'manual_request' | null;
};
