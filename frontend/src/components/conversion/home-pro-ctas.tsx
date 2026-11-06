'use client';

import Link from 'next/link';
import { TrackedButtonLink } from '@/components/tracked-link';
import { useLocale } from '@/components/i18n/locale-provider';
import { useProAccess } from '@/components/pro-access-provider';
import { ProGate } from '@/components/pro/pro-cta';
import { proHomePitch, proPlan } from '@/lib/pro';

export function HomeHeroActions({
  guideHref = '/cursos/guiav1#pagar',
  guideCta = 'Comprar la guía',
}: {
  guideHref?: string;
  guideCta?: string;
}) {
  const { me, hasPro, loading } = useProAccess();
  const { t, format } = useLocale();
  const anonymous = !loading && !me;
  const registeredWithoutPro = !loading && Boolean(me) && !hasPro;
  const proLabel = format(t.pro.makeProWithPrice, { price: proPlan.priceShort });

  if (anonymous) {
    return (
      <div className="lp-hero__actions lp-hero__actions--stack">
        <TrackedButtonLink
          href="/register"
          size="lg"
          block
          event="register_cta_clicked"
          eventProperties={{ source: 'home_hero' }}
        >
          {t.home.registerFree}
        </TrackedButtonLink>
        <TrackedButtonLink
          href={proPlan.checkoutHref}
          size="lg"
          block
          event="pro_cta_clicked"
          eventProperties={{ source: 'home_hero' }}
        >
          {proLabel}
        </TrackedButtonLink>
        <TrackedButtonLink
          href="/promotions"
          variant="secondary"
          size="lg"
          block
          event="promotion_list_cta_clicked"
          eventProperties={{ source: 'home_hero' }}
        >
          {t.home.seeLatestPromos}
        </TrackedButtonLink>
      </div>
    );
  }

  if (registeredWithoutPro) {
    return (
      <div className="lp-hero__actions lp-hero__actions--stack">
        <TrackedButtonLink
          href={proPlan.checkoutHref}
          size="lg"
          block
          event="pro_cta_clicked"
          eventProperties={{ source: 'home_hero_registered' }}
        >
          {proLabel}
        </TrackedButtonLink>
        <TrackedButtonLink
          href="/promotions"
          variant="secondary"
          size="lg"
          block
          event="promotion_list_cta_clicked"
          eventProperties={{ source: 'home_hero_registered' }}
        >
          {t.home.seePromos}
        </TrackedButtonLink>
        <TrackedButtonLink
          href={guideHref}
          variant="secondary"
          size="lg"
          block
          event="course_cta_clicked"
          eventProperties={{ source: 'home_hero_registered' }}
        >
          {guideCta || t.home.buyGuide}
        </TrackedButtonLink>
      </div>
    );
  }

  return (
    <div className="lp-hero__actions lp-hero__actions--stack">
      <TrackedButtonLink
        href="/promotions"
        size="lg"
        block
        event="promotion_list_cta_clicked"
        eventProperties={{ source: 'home_hero' }}
      >
        {t.home.seePromos}
      </TrackedButtonLink>
      <TrackedButtonLink
        href={guideHref}
        variant="secondary"
        size="lg"
        block
        event="course_cta_clicked"
        eventProperties={{ source: 'home_hero' }}
      >
        {guideCta || t.home.buyGuide}
      </TrackedButtonLink>
      <p className="text-sm text-[var(--ink-soft)]">
        <Link href={proPlan.landingHref} className="font-semibold text-[var(--green-700)] underline">
          {t.pro.heroLink}
        </Link>
      </p>
    </div>
  );
}

export function HomeFinalCtaBand({ includedGuideTitles = [] }: { includedGuideTitles?: string[] }) {
  const { t, format } = useLocale();
  const proLabel = format(t.pro.makeProWithPrice, { price: proPlan.priceShort });

  return (
    <ProGate>
      <div className="public-cta-band">
        <div>
          <h2 className="lp-title lp-title--sm">{t.pro.finalTitle}</h2>
          <p className="lp-lead">{proHomePitch(includedGuideTitles)}</p>
        </div>
        <div className="public-cta-band__actions">
          <TrackedButtonLink
            href={proPlan.checkoutHref}
            size="lg"
            block
            event="pro_cta_clicked"
            eventProperties={{ source: 'home_final' }}
          >
            {proLabel}
          </TrackedButtonLink>
        </div>
      </div>
    </ProGate>
  );
}
