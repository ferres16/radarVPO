import Link from 'next/link';
import { Promotion } from '@/types';
import { MotionCard } from './motion-primitives';

function displayDate(promotion: Promotion) {
  if (promotion.status === 'published_reviewed' || promotion.status === 'published_unreviewed') {
    return promotion.publishedAt ? `Publicado: ${promotion.publishedAt.slice(0, 10)}` : null;
  }

  return promotion.deadlineDate ? `Fin: ${promotion.deadlineDate.slice(0, 10)}` : null;
}

function statusLabel(status: Promotion['status']) {
  if (status === 'pending_review') return 'Pendiente de revision';
  if (status === 'published_unreviewed') return 'Información en actualización';
  if (status === 'published_reviewed') return 'Promoción completa';
  return 'Archivada';
}

function statusTone(status: Promotion['status']) {
  if (status === 'published_reviewed') return 'border-[rgba(22,112,85,0.24)] bg-[rgba(22,112,85,0.10)] text-[var(--green-700)]';
  if (status === 'published_unreviewed') return 'border-[rgba(244,197,66,0.34)] bg-[rgba(244,197,66,0.16)] text-[#7a5600]';
  return 'border-[var(--stroke)] bg-[var(--bg-app)] text-[var(--ink-soft)]';
}

function promotionTypeLabel(type: Promotion['promotionType']) {
  if (type === 'mixto') return 'Venta y alquiler';
  if (type === 'desconocido') return 'Régimen por confirmar';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function PromotionCard({
  promotion,
  hideDetail = false,
  hideStatus = false,
  titleOverride,
}: {
  promotion: Promotion;
  hideDetail?: boolean;
  hideStatus?: boolean;
  titleOverride?: string;
}) {
  return (
    <MotionCard className="group flex h-full flex-col rounded-[1.5rem] border border-[var(--stroke)] bg-white p-4 shadow-card transition duration-300 hover:border-[rgba(22,112,85,0.30)] hover:shadow-[0_18px_40px_rgba(30,31,28,0.10)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-bold leading-6 text-[var(--ink)]">{titleOverride || promotion.title}</h3>
        {!hideStatus ? (
          <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${statusTone(promotion.status)}`}>
            {statusLabel(promotion.status)}
          </span>
        ) : null}
      </div>
      <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Ubicación</p>
        <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
          {promotion.municipality || 'Catalunya'} {promotion.province ? `, ${promotion.province}` : ''}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="chip">{promotionTypeLabel(promotion.promotionType)}</span>
        {displayDate(promotion) ? <span className="chip">{displayDate(promotion)}</span> : null}
      </div>
      {!hideDetail ? (
        <Link
          href={`/promotions/${promotion.id}`}
          className="mt-auto inline-flex w-fit rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-semibold text-white outline-none transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--green-900)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
        >
          Ver ficha
        </Link>
      ) : null}
    </MotionCard>
  );
}
