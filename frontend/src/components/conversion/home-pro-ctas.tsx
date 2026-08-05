'use client';

import { ButtonLink } from '@/components/design-system';
import { ProCta, ProGate } from '@/components/pro/pro-cta';
import { proPlan } from '@/lib/pro';

export function HomeHeroActions() {
  return (
    <div className="lp-hero__actions lp-hero__actions--stack">
      <ButtonLink href="/promotions" size="lg" block>
        Ver promociones
      </ButtonLink>
      <ButtonLink href="/register" variant="secondary" size="lg" block>
        Crear cuenta gratis
      </ButtonLink>
    </div>
  );
}

export function HomeFinalCtaBand() {
  return (
    <ProGate>
      <div className="public-cta-band">
        <div>
          <h2 className="lp-title lp-title--sm">¿Quieres avisos por email y SMS?</h2>
          <p className="lp-lead">
            VPO PRO te avisa cuando detectamos un lanzamiento relevante e incluye el curso Guía VPO. {proPlan.price}
          </p>
        </div>
        <div className="public-cta-band__actions">
          <ProCta size="lg" block />
        </div>
      </div>
    </ProGate>
  );
}
