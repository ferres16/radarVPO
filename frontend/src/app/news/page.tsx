import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { NewsCard } from '@/components/news-card';

export default async function NewsPage() {
  const news = await api.getNews().catch(() => []);

  return (
    <main className="shell space-y-6 pb-10">
      <header className="rounded-[1.75rem] border border-[var(--stroke)] bg-[linear-gradient(135deg,rgba(78,143,58,0.10),rgba(255,255,255,0.96))] p-6 shadow-card animate-fade-up">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Noticias</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--ink)] md:text-4xl">
          Actualidad de vivienda en Catalunya
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[var(--ink-soft)]">
          Noticias y contexto útil para entender cambios normativos, convocatorias y mercado de vivienda pública.
        </p>
      </header>

      {news.length === 0 ? (
        <EmptyState title="Sin noticias publicadas" description="Aún no hay noticias disponibles." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {news.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </main>
  );
}
