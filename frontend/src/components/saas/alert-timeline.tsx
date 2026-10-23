'use client';

import Link from 'next/link';
import { formatEstimatedDate } from '@/lib/alert-countdown';
import { shortenAlertTitle } from '@/lib/alert-title';
import { canonicalizeMunicipality } from '@/lib/municipality';
import type { Promotion } from '@/types';

export function AlertTimeline({ alerts }: { alerts: Promotion[] }) {
  return (
    <div className="alert-timeline">
      {alerts.map((alert, index) => {
        const isLast = index === alerts.length - 1;
        const place =
          canonicalizeMunicipality(alert.municipality) ||
          alert.municipality ||
          'Cataluña';
        const estimatedLabel = formatEstimatedDate(alert.estimatedPublicationDate);
        const sourceUrl =
          alert.sourceUrl?.startsWith('http') ? alert.sourceUrl : null;
        return (
          <article key={alert.id} className="alert-timeline__item">
            <div className="alert-timeline__rail" aria-hidden="true">
              <span className="alert-timeline__dot" />
              {!isLast ? <span className="alert-timeline__line" /> : null}
            </div>
            <div className="saas-card-rail">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                Aviso previo
              </p>
              <h3 className="mt-2 text-base font-bold leading-snug text-[var(--ink)]">
                {shortenAlertTitle(alert.title)}
              </h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{place}</p>
              {estimatedLabel ? (
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Estimación de publicación: <span className="font-semibold text-[var(--ink)]">{estimatedLabel}</span>
                  . No es una fecha oficial.
                </p>
              ) : (
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Sin estimación fiable de publicación.
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                {sourceUrl ? (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--green-700)] underline"
                  >
                    Ver anuncio de origen
                  </a>
                ) : null}
                <Link href={`/promotions/${alert.id}`} className="text-[var(--green-700)] underline">
                  Ver ficha
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
