'use client';

import { CourseAccessLink, useCourseAccess } from '@/components/course-access';

type CourseStickyBuyBarProps = {
  priceLabel: string;
  lockedHref: string;
  lockedLabel: string;
  hint?: string;
};

export function CourseStickyBuyBar({ priceLabel, lockedHref, lockedLabel, hint }: CourseStickyBuyBarProps) {
  const { canAccess, resolved, initialCanAccess } = useCourseAccess();
  const hasAccess = resolved ? canAccess : initialCanAccess;

  if (hasAccess) return null;

  return (
    <div className="course-sticky-buy md:hidden" role="region" aria-label="Comprar curso">
      <div className="course-sticky-buy__inner">
        <div className="min-w-0">
          <p className="course-sticky-buy__label">Pago único</p>
          <p className="course-sticky-buy__price">{priceLabel}</p>
          {hint ? <p className="course-sticky-buy__hint">{hint}</p> : null}
        </div>
        <div className="course-sticky-buy__actions">
          <CourseAccessLink
            hrefWhenAccess="/"
            hrefWhenLocked={lockedHref}
            lockedLabel={lockedLabel}
            accessLabel="Continuar curso"
            className="btn btn--primary btn--sm shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
