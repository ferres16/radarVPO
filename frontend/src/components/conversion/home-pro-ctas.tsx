'use client';

import { ButtonLink } from '@/components/design-system';
import { ProGate } from '@/components/pro/pro-cta';
import { proPlan } from '@/lib/pro';

export function HomeHeroActions() {
  return (
    <div className="lp-hero__actions lp-hero__actions--stack">
      <ButtonLink href="/promotions" size="lg" block>
        Ver promociones
      </ButtonLink>
      <ButtonLink href="/cursos" variant="secondary" size="lg" block>
        Aprender a preparar mi solicitud
      </ButtonLink>
    </div>
  );
}

export function HomeFinalCtaBand() {
  return (
    <ProGate>
      <div className="public-cta-band">
        <div>
          <h2 className="lp-title lp-title--sm">¿Quieres que te avisemos?</h2>
          <p className="lp-lead">
            {proPlan.name} envía avisos por email y SMS cuando se publica una nueva promoción y te da un espacio para
            organizarlas. {proPlan.price}.
          </p>
        </div>
        <div className="public-cta-band__actions">
          <ButtonLink href={proPlan.landingHref} size="lg" block>
            Ver Radar VPO PRO
          </ButtonLink>
        </div>
      </div>
    </ProGate>
  );
}
