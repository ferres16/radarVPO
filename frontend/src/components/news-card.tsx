import Link from 'next/link';
import { NewsItem } from '@/types';

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-[var(--bg-eco)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
          {item.topic || item.relevance}
        </span>
        <span className="text-xs text-[var(--ink-soft)]">{item.publishedAt.slice(0, 10)}</span>
      </div>
      <h3 className="text-base font-semibold text-[var(--ink)]">{item.title}</h3>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.summary || 'Sin resumen disponible.'}</p>
      {item.practicalImpact ? (
        <p className="mt-2 text-xs text-[var(--ink-soft)]">{item.practicalImpact}</p>
      ) : null}
      <Link
        href={`/news/${item.id}`}
        className="mt-4 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white outline-none transition hover:bg-[var(--green-700)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
      >
        Leer
      </Link>
    </article>
  );
}
