import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { absoluteUrl } from '@/lib/seo';

const staticRoutes = [
  '/',
  '/promotions',
  '/alerts',
  '/cursos',
  '/services',
  '/news',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [promotions, courses, news] = await Promise.all([
    api.getPromotions('?limit=100').catch(() => []),
    api.listCourses().catch(() => []),
    api.getNews().catch(() => []),
  ]);

  const now = new Date();
  const staticEntries = staticRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === '/' ? 'daily' as const : 'weekly' as const,
    priority: route === '/' ? 1 : 0.8,
  })) satisfies MetadataRoute.Sitemap;

  const promotionEntries = promotions
    .filter((promotion) => promotion.status !== 'archived')
    .map((promotion) => ({
      url: absoluteUrl(`/promotions/${promotion.id}`),
      lastModified: promotion.publishedAt ? new Date(promotion.publishedAt) : now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })) satisfies MetadataRoute.Sitemap;

  const courseEntries = courses.map((course) => ({
    url: absoluteUrl(`/cursos/${course.slug}`),
    lastModified: course.updatedAt ? new Date(course.updatedAt) : course.publishedAt ? new Date(course.publishedAt) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  })) satisfies MetadataRoute.Sitemap;

  const newsEntries = news.map((item) => ({
    url: absoluteUrl(`/news/${item.id}`),
    lastModified: new Date(item.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.55,
  })) satisfies MetadataRoute.Sitemap;

  return [...staticEntries, ...promotionEntries, ...courseEntries, ...newsEntries];
}
