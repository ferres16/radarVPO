'use client';

import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { getDaysRemaining } from '@/lib/alert-countdown';
import { shortenAlertTitle } from '@/lib/alert-title';
import { resolveMunicipalityLabel } from '@/lib/municipalities';
import type { Promotion } from '@/types';

function alertMunicipalityLabel(alert: Promotion): string | null {
  const label = resolveMunicipalityLabel(alert.municipality, alert.municipalityId).trim();
  if (!label) return null;
  // Residuos frecuentes del scraper / OCR que no son municipio.
  if (/^(vigor|termini|dies|anunci|plazo|días|catalunya|cataluña)$/i.test(label)) {
    return null;
  }
  return label;
}

export function AlertTimeline({ alerts }: { alerts: Promotion[] }) {
  return (
    <div className="alert-timeline">
      {alerts.map((alert, index) => {
        const daysRemaining = getDaysRemaining(alert.estimatedPublicationDate);
        const isLast = index === alerts.length - 1;
        const municipality = alertMunicipalityLabel(alert);
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
              {municipality ? (
                <p className="mt-1 text-sm text-[var(--ink-soft)]">{municipality}</p>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
