'use client';

import { TrackedButtonLink } from '@/components/tracked-link';
import { ProGate } from '@/components/pro/pro-cta';
import { proPlan } from '@/lib/pro';

export function HomeHeroActions() {
  return (
    <div className="lp-hero__actions lp-hero__actions--stack">
      <TrackedButtonLink
        href="/promotions"
        size="lg"
        block
        event="promotion_list_cta_clicked"
        eventProperties={{ source: 'home_hero' }}
      >
        Ver promociones
      </TrackedButtonLink>
      <TrackedButtonLink
        href="/cursos"
        variant="secondary"
        size="lg"
        block
        event="course_cta_clicked"
        eventProperties={{ source: 'home_hero' }}
      >
        Ver el curso
      </TrackedButtonLink>
    </div>
  );
}

export function HomeFinalCtaBand() {
  return (
    <ProGate>
      <div className="public-cta-band">
        <div>
          <h2 className="lp-title lp-title--sm">Avisos por SMS y espacio sin límite</h2>
          <p className="lp-lead">
            Consultar PDF es gratis. {proPlan.name} añade el aviso en el móvil, organización en tu cuenta y el curso
            inicial mientras esté activa. {proPlan.price}. Cancelas desde Mi cuenta.
          </p>
        </div>
        <div className="public-cta-band__actions">
          <TrackedButtonLink
            href={proPlan.landingHref}
            size="lg"
            block
            event="pro_cta_clicked"
            eventProperties={{ source: 'home_final' }}
          >
            Ver Radar VPO PRO
          </TrackedButtonLink>
        </div>
      </div>
    </ProGate>
  );
}
