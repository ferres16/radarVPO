import Link from 'next/link';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { getDaysRemaining } from '@/lib/alert-countdown';
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
              <AlertCountdownBadge daysRemaining={daysRemaining} size="sm" />
              <h3 className="mt-3 text-base font-bold leading-snug text-[var(--ink)]">{alert.title}</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{alert.municipality || 'Cataluña'}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <Link href={`/promotions/${alert.id}`} className="btn btn--primary min-h-11 px-4 py-2 text-sm">
                  Ver ficha
                </Link>
                <Link href="/register?intent=pro" className="btn btn--secondary min-h-11 px-4 py-2 text-sm">
                  Avisarme
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
