'use client';

import Link from 'next/link';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { Stagger, StaggerItem } from '@/components/motion-primitives';
import { getDaysRemaining } from '@/lib/alert-countdown';
import type { Promotion } from '@/types';

function summarizeTitle(title: string) {
  const trimmed = title.trim();
  if (trimmed.length <= 72) return trimmed;
  return `${trimmed.slice(0, 69)}…`;
}

export function AlertTimeline({ alerts }: { alerts: Promotion[] }) {
  return (
    <Stagger className="alert-timeline">
      {alerts.map((alert, index) => {
        const daysRemaining = getDaysRemaining(alert.estimatedPublicationDate);
        const isLast = index === alerts.length - 1;
        const statusLabel = daysRemaining === null ? 'En seguimiento' : daysRemaining <= 7 ? 'Urgente' : 'Monitorizando';

        return (
          <StaggerItem key={alert.id}>
            <article className="alert-timeline__item">
              <div className="alert-timeline__rail" aria-hidden="true">
                <span className={`alert-timeline__dot ${daysRemaining !== null && daysRemaining <= 7 ? 'alert-timeline__dot--urgent' : ''}`} />
                {!isLast ? <span className="alert-timeline__line" /> : null}
              </div>
              <div className="alert-timeline__card">
                <div className="alert-timeline__head">
                  <AlertCountdownBadge daysRemaining={daysRemaining} size="sm" />
                  <span className={`alert-timeline__status alert-timeline__status--${statusLabel === 'Urgente' ? 'urgent' : 'watch'}`}>
                    {statusLabel}
                  </span>
                </div>
                <h3 className="alert-timeline__title">{summarizeTitle(alert.title)}</h3>
                <dl className="alert-timeline__meta">
                  <div>
                    <dt>Municipio</dt>
                    <dd>{alert.municipality || 'Cataluña'}</dd>
                  </div>
                  {alert.promoter ? (
                    <div>
                      <dt>Entidad</dt>
                      <dd>{alert.promoter}</dd>
                    </div>
                  ) : null}
                  {alert.estimatedPublicationDate ? (
                    <div>
                      <dt>Publicación est.</dt>
                      <dd>{alert.estimatedPublicationDate.slice(0, 10)}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className="alert-timeline__actions">
                  <Link href={`/promotions/${alert.id}`} className="btn btn--secondary min-h-11 flex-1 text-sm">
                    Ver ficha
                  </Link>
                  <Link href="/register?intent=pro" className="btn btn--primary min-h-11 flex-1 text-sm">
                    Avísame
                  </Link>
                </div>
              </div>
            </article>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
