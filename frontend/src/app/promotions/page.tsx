import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { PromotionCard } from '@/components/promotion-card';

export default async function PromotionsPage() {
  const promotions = await api.getPromotions();

  return (
    <main className="shell">
      <header className="mb-5 rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Todas las promociones</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Listado completo de promociones publicadas y upcoming.</p>
      </header>

      {promotions.length === 0 ? (
        <EmptyState title="Sin promociones" description="Todavia no hay promociones disponibles." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </div>
      )}
    </main>
  );
}
