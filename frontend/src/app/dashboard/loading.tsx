import { SkeletonCard } from '@/components/skeleton-card';

export default function DashboardLoading() {
  return (
    <main className="shell grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </main>
  );
}
