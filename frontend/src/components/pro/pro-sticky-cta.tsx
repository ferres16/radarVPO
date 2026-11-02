'use client';

import { useEffect, useState } from 'react';
import { TrackedButtonLink } from '@/components/tracked-link';
import { useProAccess } from '@/components/pro-access-provider';
import { proPlan } from '@/lib/pro';

/** Barra fija al hacer scroll fuera del formulario de compra. */
export function ProStickyCta() {
  const { me, loading } = useProAccess();
  const [visible, setVisible] = useState(false);
  const hasPro = Boolean(me?.proAccess?.hasAccess ?? me?.plan === 'pro');

  useEffect(() => {
    const target = document.getElementById('pagar');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: '-48px 0px 0px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (loading || hasPro || !visible) return null;

  return (
    <div className="lp-pro-sticky" role="region" aria-label="Activar Radar VPO PRO">
      <div className="lp-pro-sticky__inner">
        <div className="lp-pro-sticky__copy">
          <p className="lp-pro-sticky__title">{proPlan.name}</p>
          <p className="lp-pro-sticky__meta">
            {proPlan.priceShort}/mes · alertas + WhatsApp · sin permanencia
          </p>
        </div>
        <TrackedButtonLink
          href="#pagar"
          size="lg"
          event="pro_cta_clicked"
          eventProperties={{ source: 'pro_sticky' }}
          className="lp-pro-sticky__btn"
        >
          {`Activar · ${proPlan.priceShort}/mes`}
        </TrackedButtonLink>
      </div>
    </div>
  );
}
