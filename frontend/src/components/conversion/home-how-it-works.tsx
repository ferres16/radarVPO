'use client';

import { howItWorksSteps } from '@/lib/pro';
import { Stagger, StaggerItem } from '@/components/motion-primitives';

export function HomeHowItWorks() {
  return (
    <section className="lp-section" aria-labelledby="how-title">
      <div className="shell">
        <div className="lp-section__head">
          <p className="lp-eyebrow">Cómo funciona</p>
          <h2 id="how-title" className="lp-title">
            De la señal al plazo, en cuatro pasos
          </h2>
          <p className="lp-lead">Radar VPO monitoriza el mercado para que tú te centres en prepararte.</p>
        </div>
        <Stagger className="how-steps">
          {howItWorksSteps.map((step) => (
            <StaggerItem key={step.step}>
              <article className="how-step-card">
                <span className="how-step-card__num">{step.step}</span>
                <h3 className="how-step-card__title">{step.title}</h3>
                <p className="how-step-card__text">{step.description}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
