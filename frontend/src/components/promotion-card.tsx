import Link from 'next/link';
import type { ReactNode } from 'react';
import { Promotion } from '@/types';
import { hasPublicFicha } from '@/lib/promotion-access';
import { MotionCard } from './motion-primitives';

function displayDate(promotion: Promotion) {
  if (promotion.status === 'published_reviewed' || promotion.status === 'published_unreviewed') {
    return promotion.publishedAt ? `Publicado: ${promotion.publishedAt.slice(0, 10)}` : null;
  }

  return promotion.deadlineDate ? `Fin plazo: ${promotion.deadlineDate.slice(0, 10)}` : null;
}

function promotionTypeLabel(type: Promotion['promotionType']) {
  if (type === 'mixto') return 'Venta y alquiler';
  if (type === 'desconocido') return 'Régimen por confirmar';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function CardShell({
  animated,
  className,
  children,
}: {
  animated: boolean;
  className: string;
  children: ReactNode;
}) {
  if (animated) {
    return <MotionCard className={className}>{children}</MotionCard>;
  }

  return <article className={className}>{children}</article>;
}

export function PromotionCard({
  promotion,
  hideDetail = false,
  titleOverride,
  layout = 'grid',
  animated = true,
}: {
  promotion: Promotion;
  hideDetail?: boolean;
  hideStatus?: boolean;
  titleOverride?: string;
  layout?: 'grid' | 'rail';
  animated?: boolean;
}) {
  const showFicha = hasPublicFicha(promotion) && !hideDetail;
  const location = [promotion.municipality || 'Catalunya', promotion.province]
    .filter(Boolean)
    .join(', ');
  const dateLabel = displayDate(promotion);

  if (layout === 'rail') {
    return (
      <CardShell animated={animated} className="saas-card-rail group h-full">
        <h3 className="line-clamp-3 text-[1.0625rem] font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--green-700)] md:text-lg">
          {titleOverride || promotion.title}
        </h3>
        <p className="mt-2 text-sm font-medium text-[var(--ink)]">{location}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="chip text-xs">{promotionTypeLabel(promotion.promotionType)}</span>
          {dateLabel ? <span className="chip text-xs">{dateLabel}</span> : null}
        </div>
        {!showFicha ? null : (
          <div className="mt-auto pt-4">
            <Link href={`/promotions/${promotion.id}`} className="btn btn--primary min-h-11 w-full py-2.5 text-sm font-semibold">
              Ver ficha completa
            </Link>
          </div>
        )}
      </CardShell>
    );
  }

  return (
    <CardShell animated={animated} className="premium-card group flex h-full flex-col overflow-hidden p-0">
      <div className="flex flex-1 flex-col px-5 py-5 md:px-6 md:py-6">
        <h3 className="display-type text-lg font-black leading-snug text-[var(--ink)] group-hover:text-[var(--green-700)] md:text-xl md:leading-6">
          {titleOverride || promotion.title}
        </h3>
        <div className="mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)]/70 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            Ubicación
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{location}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="chip">{promotionTypeLabel(promotion.promotionType)}</span>
          {dateLabel ? <span className="chip">{dateLabel}</span> : null}
        </div>
        {!showFicha ? null : (
          <div className="mt-auto pt-4">
            <Link
              href={`/promotions/${promotion.id}`}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--green-700)] px-4 py-2.5 text-sm font-semibold text-white outline-none transition duration-200 hover:bg-[var(--green-900)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)] md:w-fit"
            >
              Ver ficha completa
            </Link>
          </div>
        )}
      </div>
    </CardShell>
  );
}
