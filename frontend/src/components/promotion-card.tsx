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

function statusLabel(status: Promotion['status']) {
  if (status === 'pending_review') return 'Pendiente de revisión';
  if (status === 'published_unreviewed') return 'En actualización';
  if (status === 'published_reviewed') return 'Ficha completa';
  return 'Archivada';
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
  hideStatus = false,
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
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-[var(--ink-soft)]">{location}</p>
          {!hideStatus ? (
            <span className="shrink-0 text-[11px] font-medium text-[var(--ink-soft)]">
              {statusLabel(promotion.status)}
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 line-clamp-3 text-[1.0625rem] font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--green-700)] md:text-lg">
          {titleOverride || promotion.title}
        </h3>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          {[promotionTypeLabel(promotion.promotionType), dateLabel].filter(Boolean).join(' · ')}
        </p>
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
    <CardShell animated={animated} className="premium-card group flex h-full flex-col p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[var(--ink-soft)]">{location}</p>
        {!hideStatus ? (
          <span className="shrink-0 text-xs font-medium text-[var(--ink-soft)]">
            {statusLabel(promotion.status)}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 text-lg font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--green-700)] md:text-xl md:leading-6">
        {titleOverride || promotion.title}
      </h3>
      <p className="mt-3 text-sm text-[var(--ink-soft)]">
        {[promotionTypeLabel(promotion.promotionType), dateLabel].filter(Boolean).join(' · ')}
      </p>
      {!showFicha ? null : (
        <div className="mt-auto pt-5">
          <Link
            href={`/promotions/${promotion.id}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--stroke)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] outline-none transition duration-200 hover:border-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)] md:w-fit"
          >
            Ver ficha completa
          </Link>
        </div>
      )}
    </CardShell>
  );
}
