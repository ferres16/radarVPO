import Link from 'next/link';
import { Promotion } from '@/types';

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
    <article className="group rounded-[1.5rem] border border-[var(--stroke)] bg-white p-4 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(30,31,28,0.10)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-[var(--ink)]">{titleOverride || promotion.title}</h3>
        {!hideStatus ? (
          <span className="rounded-full border border-[var(--stroke)] bg-[var(--bg-eco)] px-3 py-1 text-xs font-semibold text-[var(--green-700)] transition group-hover:bg-white">
            {statusLabel(promotion.status)}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-[var(--ink-soft)]">
        {promotion.municipality || 'Catalunya'} {promotion.province ? `, ${promotion.province}` : ''}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="chip">{promotion.promotionType}</span>
        {displayDate(promotion) ? <span className="chip">{displayDate(promotion)}</span> : null}
      </div>
      {!hideDetail ? (
        <Link
          href={`/promotions/${promotion.id}`}
          className="mt-4 inline-flex rounded-full bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white outline-none transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--green-700)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
        >
          Ver detalle
        </Link>
      ) : null}
    </article>
  );
}
