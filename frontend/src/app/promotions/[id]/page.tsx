import { notFound } from 'next/navigation';
import { api } from '@/lib/api';

export default async function PromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promotion = await api.getPromotionById(id).catch(() => null);

  if (!promotion) {
    return notFound();
  }

  return (
    <main className="shell">
      <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">{promotion.title}</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          {promotion.municipality || 'Catalunya'} {promotion.province ? `, ${promotion.province}` : ''}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="chip">{promotion.promotionType}</span>
          <span className="chip">Estado: {promotion.status}</span>
          {promotion.deadlineDate ? <span className="chip">Deadline: {promotion.deadlineDate.slice(0, 10)}</span> : null}
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm text-[var(--ink)]">{promotion.rawText || 'Sin texto original.'}</p>
        <a href={promotion.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">
          Fuente oficial
        </a>
      </article>
    </main>
  );
}
