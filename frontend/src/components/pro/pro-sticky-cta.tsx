'use client';

import { useEffect, useState } from 'react';
import { TrackedButtonLink } from '@/components/tracked-link';
import { useLocale } from '@/components/i18n/locale-provider';
import { useProAccess } from '@/components/pro-access-provider';
import { proPlan } from '@/lib/pro';

/** Misma barra móvil que la guía (`course-sticky-buy`). */
export function ProStickyCta() {
  const { me, loading } = useProAccess();
  const { t } = useLocale();
  const [pastCheckout, setPastCheckout] = useState(false);
  const hasPro = Boolean(me?.proAccess?.hasAccess ?? me?.plan === 'pro');

  useEffect(() => {
    const target = document.getElementById('pagar');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPastCheckout(!entry.isIntersecting);
      },
      { threshold: 0.08, rootMargin: '-40px 0px 0px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (loading || hasPro) return null;

  // Igual que la guía: visible en móvil. Si el formulario ya está en pantalla, se oculta.
  if (!pastCheckout) return null;

  return (
    <div className="course-sticky-buy md:hidden" role="region" aria-label={t.pro.activate}>
      <div className="course-sticky-buy__inner">
        <div className="min-w-0">
          <p className="course-sticky-buy__label">{t.pro.monthly}</p>
          <p className="course-sticky-buy__price">{proPlan.priceShort}</p>
        </div>
        <div className="course-sticky-buy__actions">
          <TrackedButtonLink
            href="#pagar"
            event="pro_cta_clicked"
            eventProperties={{ source: 'pro_sticky' }}
            className="btn btn--primary btn--sm shrink-0 font-black"
          >
            {t.pro.activate}
          </TrackedButtonLink>
        </div>
      </div>
    </div>
  );
}
