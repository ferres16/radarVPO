'use client';

import { proIncludes } from '@/lib/pro';
import { Stagger, StaggerItem } from '@/components/motion-primitives';

export function HomeProIncludes() {
  return (
    <section className="lp-section lp-section--border" aria-labelledby="pro-includes-title">
      <div className="shell">
        <div className="lp-section__head">
          <p className="lp-eyebrow">VPO PRO</p>
          <h2 id="pro-includes-title" className="lp-title">
            Todo lo que desbloqueas al activar PRO
          </h2>
          <p className="lp-lead">Pago seguro · sin permanencia · cancela cuando quieras</p>
        </div>
        <Stagger className="pro-includes-grid">
          {proIncludes.map((item) => (
            <StaggerItem key={item.title}>
              <article className="pro-include-card">
                <span className="pro-include-card__icon" aria-hidden="true">{item.icon}</span>
                <h3 className="pro-include-card__title">{item.title}</h3>
                <p className="pro-include-card__text">{item.description}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
