'use client';

import Link from 'next/link';
import { Promotion } from '@/types';
import { MotionCard } from './motion-primitives';

function displayDate(promotion: Promotion) {
  if (promotion.status === 'published_reviewed' || promotion.status === 'published_unreviewed') {
    return promotion.publishedAt ? `Publicado: ${promotion.publishedAt.slice(0, 10)}` : null;
  }

  return promotion.deadlineDate ? `Fin plazo: ${promotion.deadlineDate.slice(0, 10)}` : null;
}

function isRecentlyUpdated(promotion: Promotion) {
  const date = promotion.publishedAt || promotion.createdAt;
  if (!date) return false;
  const diff = Date.now() - new Date(date).getTime();
  return diff >= 0 && diff < 1000 * 60 * 60 * 24 * 14;
}

function statusLabel(status: Promotion['status']) {
  if (status === 'pending_review') return 'Pendiente de revisión';
  if (status === 'published_unreviewed') return 'En actualización';
  if (status === 'published_reviewed') return 'Ficha completa';
  return 'Archivada';
}

function statusTone(status: Promotion['status']) {
  if (status === 'published_reviewed') return 'border-[rgba(22,112,85,0.24)] bg-[rgba(22,112,85,0.10)] text-[var(--green-700)]';
  if (status === 'published_unreviewed') return 'border-[rgba(232,184,74,0.34)] bg-[rgba(232,184,74,0.16)] text-[#7a5600]';
  return 'border-[var(--stroke)] bg-[var(--bg-app)] text-[var(--ink-soft)]';
}

function promotionTypeLabel(type: Promotion['promotionType']) {
  if (type === 'mixto') return 'Venta y alquiler';
  if (type === 'desconocido') return 'Régimen por confirmar';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function urgencyCopy(promotion: Promotion) {
  if (promotion.deadlineDate) return 'Revisa plazos antes de que cierren';
  if (isRecentlyUpdated(promotion)) return 'Actualizado recientemente';
  return 'Últimas oportunidades activas';
}

export function PromotionCard({
  promotion,
  hideDetail = false,
  hideStatus = false,
  titleOverride,
  layout = 'grid',
}: {
  promotion: Promotion;
  hideDetail?: boolean;
  hideStatus?: boolean;
  titleOverride?: string;
  layout?: 'grid' | 'rail';
}) {
  const dateLabel = displayDate(promotion);
  const urgency = urgencyCopy(promotion);

  if (layout === 'rail') {
    return (
      <MotionCard className="saas-card-rail group h-full">
        <div className="flex items-start justify-between gap-2">
          <span className="promo-card__municipality">{promotion.municipality || 'Catalunya'}</span>
          {!hideStatus ? (
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone(promotion.status)}`}>
              {statusLabel(promotion.status)}
            </span>
          ) : null}
        </div>
        <p className="promo-card__urgency">{urgency}</p>
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--green-700)]">
          {titleOverride || promotion.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="chip text-[11px]">{promotionTypeLabel(promotion.promotionType)}</span>
          {dateLabel ? <span className="chip text-[11px] chip--urgent">{dateLabel}</span> : null}
        </div>
        {promotion.publicDescription ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--ink-soft)]">{promotion.publicDescription}</p>
        ) : null}
        {!hideDetail ? (
          <Link href={`/promotions/${promotion.id}`} className="btn btn--primary mt-auto min-h-11 w-full py-2 text-sm">
            Ver ficha completa
          </Link>
        ) : null}
      </MotionCard>
    );
  }

  return (
    <MotionCard className="premium-card group flex h-full flex-col p-5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="promo-card__municipality">{promotion.municipality || 'Catalunya'}</span>
        {!hideStatus ? (
          <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${statusTone(promotion.status)}`}>
            {statusLabel(promotion.status)}
          </span>
        ) : null}
      </div>
      <p className="promo-card__urgency">{urgency}</p>
      <h3 className="mt-1 text-lg font-bold leading-6 text-[var(--ink)] group-hover:text-[var(--green-700)] md:text-xl">
        {titleOverride || promotion.title}
      </h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="chip">{promotionTypeLabel(promotion.promotionType)}</span>
        {dateLabel ? <span className="chip chip--urgent">{dateLabel}</span> : null}
        {promotion.province ? <span className="chip">{promotion.province}</span> : null}
      </div>
      {!hideDetail ? (
        <Link
          href={`/promotions/${promotion.id}`}
          className="btn btn--primary mt-auto min-h-11 w-full md:w-auto"
        >
          Ver ficha completa
        </Link>
      ) : null}
    </MotionCard>
  );
}
