'use client';

import { useProAccess } from '@/components/pro-access-provider';
import { TrackedLink } from '@/components/tracked-link';
import { registerHref } from '@/lib/register-promo';

export function PromotionLockedAction({
  promotionId,
  className,
}: {
  promotionId: string;
  className: string;
}) {
  const { me } = useProAccess();
  const loggedIn = Boolean(me);

  return (
    <TrackedLink
      href={loggedIn ? '/account' : registerHref(`/promotions/${promotionId}`)}
      className={className}
      event="register_cta_clicked"
      eventProperties={{ promotionId, source: 'card_locked' }}
    >
      {loggedIn ? 'Confirma tu email para ver el PDF' : 'Regístrate gratis para ver el PDF'}
    </TrackedLink>
  );
}
