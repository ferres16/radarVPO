'use client';

import { proPlan } from '@/lib/pro';
import { CourseAccessLink, useCourseAccess } from '@/components/course-access';
import { ProCta } from '@/components/pro/pro-cta';

type CourseStickyBuyBarProps = {
  priceLabel: string;
  lockedHref: string;
  lockedLabel: string;
  includedInPro: boolean;
};

export function CourseStickyBuyBar({
  priceLabel,
  lockedHref,
  lockedLabel,
  includedInPro,
}: CourseStickyBuyBarProps) {
  const { canAccess, resolved, initialCanAccess } = useCourseAccess();
  const hasAccess = resolved ? canAccess : initialCanAccess;

  if (hasAccess) return null;

  return (
    <div className="course-sticky-buy md:hidden" role="region" aria-label="Comprar curso">
      <div className="course-sticky-buy__inner">
        <div className="min-w-0">
          <p className="course-sticky-buy__label">Acceso al curso</p>
          <p className="course-sticky-buy__price">{priceLabel}</p>
        </div>
        <div className="course-sticky-buy__actions">
          <CourseAccessLink
            hrefWhenAccess="/"
            hrefWhenLocked={lockedHref}
            lockedLabel={lockedLabel}
            accessLabel="Empezar"
            className="btn btn--primary btn--sm shrink-0"
          />
          {includedInPro ? (
            <ProCta variant="secondary" className="shrink-0 !min-h-[44px] !px-3 !text-xs" label="PRO" />
          ) : null}
        </div>
      </div>
      {includedInPro ? (
        <p className="course-sticky-buy__hint">Incluido en {proPlan.name} · {proPlan.price}</p>
      ) : null}
    </div>
  );
}
