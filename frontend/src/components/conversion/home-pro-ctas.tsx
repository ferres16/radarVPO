'use client';

import { TrackedButtonLink } from '@/components/tracked-link';
import { ProGate } from '@/components/pro/pro-cta';
import { proHomePitch, proPlan } from '@/lib/pro';

export function HomeHeroActions({
  guideHref = '/cursos/guiav1',
  guideCta = 'Descubrir la guía',
}: {
  guideHref?: string;
  guideCta?: string;
}) {
  return (
    <div className="lp-hero__actions lp-hero__actions--stack">
      <TrackedButtonLink
        href="/promotions"
        size="lg"
        block
        event="promotion_list_cta_clicked"
        eventProperties={{ source: 'home_hero' }}
      >
        Ver promociones gratis
      </TrackedButtonLink>
      <TrackedButtonLink
        href={guideHref}
        variant="secondary"
        size="lg"
        block
        event="course_cta_clicked"
        eventProperties={{ source: 'home_hero' }}
      >
        {guideCta}
      </TrackedButtonLink>
    </div>
  );
}

export function HomeFinalCtaBand({ includedGuideTitles = [] }: { includedGuideTitles?: string[] }) {
  return (
    <ProGate>
      <div className="public-cta-band">
        <div>
          <h2 className="lp-title lp-title--sm">Avisos sin revisar las webs cada día</h2>
          <p className="lp-lead">{proHomePitch(includedGuideTitles)}</p>
        </div>
        <div className="public-cta-band__actions">
          <TrackedButtonLink
            href={proPlan.landingHref}
            size="lg"
            block
            event="pro_cta_clicked"
            eventProperties={{ source: 'home_final' }}
          >
            {`Descubrir ${proPlan.name}`}
          </TrackedButtonLink>
        </div>
      </div>
    </ProGate>
  );
}
