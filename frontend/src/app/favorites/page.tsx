import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { PromotionCard } from '@/components/promotion-card';

export default async function FavoritesPage() {
  const favorites = await api.getFavorites();

  return (
    <main className="shell">
      <h1 className="mb-4 text-2xl font-bold text-[var(--ink)]">Favoritos</h1>
      {favorites.length === 0 ? (
        <EmptyState title="Sin favoritos" description="Guarda promociones para hacer seguimiento." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((item) => (
            <PromotionCard key={item.id} promotion={item.promotion} />
          ))}
        </div>
      )}
    </main>
  );
}
