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

  if (layout === 'rail') {
    return (
      <CardShell animated={animated} className="saas-card-rail group h-full">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex rounded-full bg-[rgba(22,112,85,0.10)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--green-700)]">
            VPO
          </span>
          {!hideStatus ? (
            <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusTone(promotion.status)}`}>
              {statusLabel(promotion.status)}
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 line-clamp-3 text-[1.0625rem] font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--green-700)] md:text-lg">
          {titleOverride || promotion.title}
        </h3>
        <p className="mt-2 text-sm font-medium text-[var(--ink)]">
          {promotion.municipality || 'Catalunya'}
          {promotion.province ? ` · ${promotion.province}` : ''}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="chip text-xs">{promotionTypeLabel(promotion.promotionType)}</span>
          {displayDate(promotion) ? <span className="chip text-xs">{displayDate(promotion)}</span> : null}
        </div>
        {!showFicha ? null : (
          <Link href={`/promotions/${promotion.id}`} className="btn btn--primary mt-4 min-h-11 w-full py-2.5 text-sm font-semibold">
            Ver ficha completa
          </Link>
        )}
      </CardShell>
    );
  }

  return (
    <CardShell animated={animated} className="premium-card group flex h-full flex-col p-4 md:p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <span className="inline-flex rounded-full bg-[rgba(22,112,85,0.10)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--green-700)]">
            Publicada
          </span>
          <h3 className="mt-2 text-lg font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--green-700)] md:text-xl md:leading-6">
            {titleOverride || promotion.title}
          </h3>
        </div>
        {!hideStatus ? (
          <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${statusTone(promotion.status)}`}>
            {statusLabel(promotion.status)}
          </span>
        ) : null}
      </div>
      <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)]/80 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Ubicación</p>
        <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
          {promotion.municipality || 'Catalunya'} {promotion.province ? `, ${promotion.province}` : ''}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="chip">{promotionTypeLabel(promotion.promotionType)}</span>
        {displayDate(promotion) ? <span className="chip">{displayDate(promotion)}</span> : null}
      </div>
      {!showFicha ? null : (
        <Link
          href={`/promotions/${promotion.id}`}
          className="mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--green-700)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm outline-none transition duration-200 hover:bg-[var(--green-900)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)] md:w-fit md:hover:-translate-y-0.5 md:hover:shadow-glow"
        >
          Ver ficha completa
        </Link>
      )}
    </CardShell>
  );
}
