'use client';

import { ProCta, ProGate } from '@/components/pro/pro-cta';
import { proPlan } from '@/lib/pro';

type AlertsProCtaBandProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
};

/** Single PRO upsell for alert/promotion pages: SMS + email value, no stack of CTAs. */
export function AlertsProCtaBand({
  title = 'Recibe avisos por SMS y email',
  description = `Consultar la web es gratis. Con ${proPlan.name} te avisamos cuando se publica una nueva promoción o detectamos un próximo lanzamiento. ${proPlan.price}.`,
  ctaLabel = 'Ver Radar VPO PRO',
}: AlertsProCtaBandProps) {
  return (
    <ProGate>
      <aside className="public-pro-banner">
        <div>
          <p className="public-pro-banner__label">{proPlan.name}</p>
          <p className="public-pro-banner__title">{title}</p>
          <p className="public-pro-banner__text">{description}</p>
        </div>
        <ProCta size="lg" label={ctaLabel} />
      </aside>
    </ProGate>
  );
}
