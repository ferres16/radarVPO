'use client';

import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { getDaysRemaining } from '@/lib/alert-countdown';
import { shortenAlertTitle } from '@/lib/alert-title';
import type { Promotion } from '@/types';

export function AlertTimeline({ alerts }: { alerts: Promotion[] }) {
  return (
    <div className="alert-timeline">
      {alerts.map((alert, index) => {
        const daysRemaining = getDaysRemaining(alert.estimatedPublicationDate);
        const isLast = index === alerts.length - 1;
        return (
          <article key={alert.id} className="alert-timeline__item">
            <div className="alert-timeline__rail" aria-hidden="true">
              <span className="alert-timeline__dot" />
              {!isLast ? <span className="alert-timeline__line" /> : null}
            </div>
            <div className="saas-card-rail">
              <AlertCountdownBadge
                daysRemaining={daysRemaining}
                estimatedDate={alert.estimatedPublicationDate}
                size="sm"
              />
              <h3 className="mt-3 text-base font-bold leading-snug text-[var(--ink)]">
                {shortenAlertTitle(alert.title)}
              </h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{alert.municipality || 'Cataluña'}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
