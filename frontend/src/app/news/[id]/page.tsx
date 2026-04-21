import { notFound } from 'next/navigation';
import { api } from '@/lib/api';

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await api.getNewsById(id).catch(() => null);

  if (!item) {
    return notFound();
  }

  return (
    <main className="shell">
      <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">{item.title}</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{item.sourceName} - {item.publishedAt.slice(0, 10)}</p>
        <p className="mt-4 text-sm text-[var(--ink)]">{item.summary || 'Sin resumen disponible.'}</p>
        <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--ink)]">{item.body || 'Sin desarrollo adicional.'}</p>
        {item.practicalImpact ? (
          <div className="mt-4 rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3 text-sm text-[var(--ink)]">
            <strong>Impacto practico:</strong> {item.practicalImpact}
          </div>
        ) : null}
        <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--ink-soft)]">{item.rawText || 'Sin contenido original.'}</p>
      </article>
    </main>
  );
}
