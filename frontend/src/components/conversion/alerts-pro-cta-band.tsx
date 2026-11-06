'use client';

import { useLocale } from '@/components/i18n/locale-provider';
import { ProCta, ProGate } from '@/components/pro/pro-cta';
import { proPlan } from '@/lib/pro';

type AlertsProCtaBandProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
};

/** Single PRO upsell for alert/promotion pages: SMS + email value, no stack of CTAs. */
export function AlertsProCtaBand({
  title,
  description,
  ctaLabel,
}: AlertsProCtaBandProps) {
  const { t, format } = useLocale();
  const resolvedTitle = title ?? t.pro.alertsTitle;
  const resolvedDescription =
    description ?? format(t.pro.alertsDescription, { price: proPlan.price });
  const resolvedCta =
    ctaLabel ?? format(t.pro.makeProWithPrice, { price: proPlan.priceShort });

  return (
    <ProGate>
      <aside className="public-pro-banner">
        <div>
          <p className="public-pro-banner__label">{t.pro.bannerLabel}</p>
          <p className="public-pro-banner__title">{resolvedTitle}</p>
          <p className="public-pro-banner__text">{resolvedDescription}</p>
        </div>
        <ProCta size="lg" label={resolvedCta} />
      </aside>
    </ProGate>
  );
}
