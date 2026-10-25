import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { InlineAdCard } from '@/components/ads';
import { StructuredData } from '@/components/structured-data';
import {
  getNewsArticleUrl,
  getNewsNextStep,
  newsSourceLooksLikeHomepage,
} from '@/lib/news-source';
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
    image: item.coverImageUrl || undefined,
    keywords: [item.topic || '', item.category || '', 'vivienda protegida'].filter(Boolean),
  });
}

export default async function NewsDetailPage({ params }: NewsDetailParams) {
  const { id } = await params;
  const item = await getNewsItem(id);

  if (!item) {
    return notFound();
  }

  const articleUrl = getNewsArticleUrl(item);
  const nextStep = getNewsNextStep(item);
  const weakSource = articleUrl ? newsSourceLooksLikeHomepage(articleUrl) : false;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.title,
    description: item.summary || item.practicalImpact || undefined,
    datePublished: item.publishedAt,
    mainEntityOfPage: absoluteUrl(`/news/${item.id}`),
    image: item.coverImageUrl ? [item.coverImageUrl] : undefined,
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
    <main className="shell py-6 md:py-10">
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
      <article className="overflow-hidden rounded-3xl border border-[var(--stroke)] bg-white shadow-card">
        {item.coverImageUrl ? (
          <div className="relative aspect-[16/9] w-full bg-[var(--bg-eco)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-[var(--ink)] md:text-3xl">{item.title}</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            {articleUrl ? (
              <a
                href={articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--green-700)] underline"
              >
                {item.sourceName || 'Fuente original'}
              </a>
            ) : (
              item.sourceName
            )}{' '}
            · {item.publishedAt.slice(0, 10)}
          </p>
          {weakSource ? (
            <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">
              El enlace apunta a la portada del medio. Comprueba en la fuente la pieza concreta y la fecha del hecho.
            </p>
          ) : null}

          <p className="mt-4 text-sm leading-7 text-[var(--ink)]">
            {item.summary || 'Sin resumen disponible.'}
          </p>
          {item.practicalImpact ? (
            <p className="mt-3 rounded-xl bg-[var(--bg-eco)] px-3 py-3 text-sm leading-6 text-[var(--ink)]">
              <strong className="font-semibold">Qué implica:</strong> {item.practicalImpact}
            </p>
          ) : null}

          <InlineAdCard className="mt-5" />
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">
            {item.body || 'Sin desarrollo adicional.'}
          </p>

          {articleUrl ? (
            <p className="mt-6 text-sm text-[var(--ink-soft)]">
              Contrasta afirmaciones normativas o económicas en la{' '}
              <a
                href={articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--green-700)] underline"
              >
                fuente original
              </a>
              .
            </p>
          ) : null}

          <aside className="mt-8 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--green-700)]">
              Siguiente paso
            </p>
            <h2 className="mt-2 text-lg font-black text-[var(--ink)]">{nextStep.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{nextStep.description}</p>
            <Link
              href={nextStep.href}
              className="mt-4 inline-flex rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-bold text-white"
            >
              {nextStep.cta}
            </Link>
          </aside>
        </div>
      </article>
    </main>
  );
}
