import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { InlineAdCard } from '@/components/ads';
import { StructuredData } from '@/components/structured-data';
import { absoluteUrl, breadcrumbJsonLd, createMetadata } from '@/lib/seo';

type NewsDetailParams = { params: Promise<{ id: string }> };

async function getNewsItem(id: string) {
  return api.getNewsById(id).catch(() => null);
}

export async function generateMetadata({ params }: NewsDetailParams): Promise<Metadata> {
  const { id } = await params;
  const item = await getNewsItem(id);

  if (!item) {
    return createMetadata({
      title: 'Noticia no disponible',
      description: 'Noticia de Radar VPO no disponible.',
      path: `/news/${id}`,
      type: 'article',
    });
  }

  return createMetadata({
    title: item.title,
    description: item.summary || item.practicalImpact || 'Noticia sobre vivienda protegida y vivienda pública.',
    path: `/news/${item.id}`,
    type: 'article',
    keywords: [item.topic || '', item.category || '', 'vivienda protegida'].filter(Boolean),
  });
}

export default async function NewsDetailPage({ params }: NewsDetailParams) {
  const { id } = await params;
  const item = await getNewsItem(id);

  if (!item) {
    return notFound();
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.title,
    description: item.summary || item.practicalImpact || undefined,
    datePublished: item.publishedAt,
    mainEntityOfPage: absoluteUrl(`/news/${item.id}`),
    author: {
      '@type': 'Organization',
      name: 'Radar VPO',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Radar VPO',
    },
  };

  return (
    <main className="shell">
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Noticias', path: '/news' },
            { name: item.title, path: `/news/${item.id}` },
          ]),
          articleJsonLd,
        ]}
      />
      <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">{item.title}</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{item.sourceName} - {item.publishedAt.slice(0, 10)}</p>
        <p className="mt-4 text-sm text-[var(--ink)]">{item.summary || 'Sin resumen disponible.'}</p>
        <InlineAdCard className="mt-5" />
        <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--ink)]">{item.body || 'Sin desarrollo adicional.'}</p>
      </article>
    </main>
  );
}
