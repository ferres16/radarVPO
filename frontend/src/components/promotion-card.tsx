import Link from 'next/link';
import { Promotion } from '@/types';

function statusLabel(status: Promotion['status']) {
  if (status === 'open') return 'Abierta';
  if (status === 'closed') return 'Cerrada';
  if (status === 'upcoming') return 'Proxima';
  return 'Borrador';
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
    <article className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-[var(--ink)]">{titleOverride || promotion.title}</h3>
        {!hideStatus ? (
          <span className="rounded-full border border-[var(--stroke)] bg-[var(--bg-eco)] px-3 py-1 text-xs font-semibold text-[var(--green-700)]">
            {statusLabel(promotion.status)}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-[var(--ink-soft)]">
        {promotion.municipality || 'Catalunya'} {promotion.province ? `, ${promotion.province}` : ''}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="chip">{promotion.promotionType}</span>
        {promotion.deadlineDate ? <span className="chip">Fin: {promotion.deadlineDate.slice(0, 10)}</span> : null}
      </div>
      {!hideDetail ? (
        <Link
          href={`/promotions/${promotion.id}`}
          className="mt-4 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white outline-none transition hover:bg-[var(--green-700)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
        >
          Ver detalle
        </Link>
      ) : null}
    </article>
  );
}
