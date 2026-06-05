import Link from 'next/link';
import { NewsItem } from '@/types';
import { MotionCard } from './motion-primitives';

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <MotionCard className="ds-card h-full p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-[var(--bg-eco)] px-3 py-1 text-xs font-semibold text-[var(--green-700)]">
          {item.topic || item.relevance}
        </span>
        <span className="text-xs text-[var(--ink-soft)]">{item.publishedAt.slice(0, 10)}</span>
      </div>
      <h3 className="display-type text-lg font-black text-[var(--ink)]">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.summary || 'Sin resumen disponible.'}</p>
      <Link
        href={`/news/${item.id}`}
        className="mt-4 inline-flex rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-semibold text-white outline-none transition hover:-translate-y-0.5 hover:bg-[var(--green-900)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
      >
        Leer
      </Link>
    </MotionCard>
  );
}
