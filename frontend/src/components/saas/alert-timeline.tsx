'use client';

import Link from 'next/link';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { useProAccess } from '@/components/pro-access-provider';
import { registerHref } from '@/lib/register-promo';
import { getDaysRemaining } from '@/lib/alert-countdown';
import { resolveAlertMunicipality } from '@/lib/alert-municipality';
import { shortenAlertTitle } from '@/lib/alert-title';
import type { Promotion } from '@/types';

export function AlertTimeline({ alerts }: { alerts: Promotion[] }) {
  const { me } = useProAccess();
  return (
    <div className="alert-timeline">
      {alerts.map((alert, index) => {
        const datesLocked = Boolean(
          (alert as Promotion & { datesLocked?: boolean }).datesLocked,
        );
        const estimatedDate = datesLocked ? null : alert.estimatedPublicationDate;
        const daysRemaining = getDaysRemaining(estimatedDate);
        const isLast = index === alerts.length - 1;
        const municipality = resolveAlertMunicipality(alert);
        return (
          <article key={alert.id} className="alert-timeline__item">
            <div className="alert-timeline__rail" aria-hidden="true">
              <span className="alert-timeline__dot" />
              {!isLast ? <span className="alert-timeline__line" /> : null}
            </div>
            <div className="saas-card-rail">
              {datesLocked ? (
                <Link
                  href={me ? '/account' : registerHref('/alerts')}
                  className="inline-flex rounded-full border border-[var(--green-700)] bg-[rgba(228,243,236,0.9)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--green-700)] hover:bg-[var(--green-700)] hover:text-white"
                >
                  {me ? 'Confirma tu email para ver la fecha' : 'Regístrate gratis para ver la fecha'}
                </Link>
              ) : daysRemaining === null ? (
                <p className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
                  Sin fecha estimada
                </p>
              ) : (
                <AlertCountdownBadge
                  daysRemaining={daysRemaining}
                  estimatedDate={estimatedDate}
                  size="sm"
                />
              )}
              {municipality ? (
                <p className="mt-3 text-sm font-black uppercase tracking-[0.14em] text-[var(--green-700)]">
                  {municipality}
                </p>
              ) : null}
              <h3 className="mt-1 text-base font-bold leading-snug text-[var(--ink)]">
                {shortenAlertTitle(alert.title)}
              </h3>
            </div>
          </article>
        );
      })}
    </div>
  );
}
