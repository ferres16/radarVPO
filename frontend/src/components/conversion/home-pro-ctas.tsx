'use client';

import { ButtonLink } from '@/components/design-system';
import { ProCta, ProGate } from '@/components/pro/pro-cta';
import { proPlan } from '@/lib/pro';

export function HomeHeroActions() {
  return (
    <div className="lp-hero__actions lp-hero__actions--stack">
      <ProCta size="lg" block />
      <ButtonLink href="/register" variant="secondary" size="lg" block>
        Crear cuenta gratis
      </ButtonLink>
    </div>
  );
}

export function HomeHeroPriceLine() {
  return (
    <ProGate>
      <p className="lp-hero__price">{proPlan.price} · cancela cuando quieras</p>
    </ProGate>
  );
}

export function HomeSolutionCta() {
  return (
    <ProGate>
      <div className="lp-section__cta">
        <ProCta size="lg" />
      </div>
    </ProGate>
  );
}

export function HomeFinalCtaBand() {
  return (
    <ProGate>
      <div className="public-cta-band">
        <div>
          <h2 className="lp-title lp-title--sm">Empieza hoy con VPO PRO</h2>
          <p className="lp-lead">Avisos por email y SMS, y curso Guía VPO incluido. {proPlan.price}</p>
        </div>
        <div className="public-cta-band__actions lp-hero__actions--stack">
          <ProCta size="lg" block />
          <ButtonLink href="/register" variant="secondary" size="lg" block>
            Crear cuenta gratis
          </ButtonLink>
        </div>
      </div>
    </ProGate>
  );
}
