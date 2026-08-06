'use client';

import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { ProCta, ProGate, ProOnlyMessage } from '@/components/pro/pro-cta';
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
              <div className="mt-auto pt-4">
                <ProGate>
                  <ProCta
                    className="btn btn--primary min-h-11 w-full px-4 py-2.5 text-sm"
                    label="Activar avisos SMS y correo con PRO"
                    block
                  />
                </ProGate>
                <ProOnlyMessage>
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center text-sm font-semibold text-emerald-800">
                    Avisos PRO activos
                  </p>
                </ProOnlyMessage>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
