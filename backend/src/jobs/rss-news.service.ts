import { Injectable } from '@nestjs/common';
import Parser from 'rss-parser';

export type RssNewsItem = {
  feedUrl: string;
  sourceName: string;
  sourceUrl: string;
  title: string;
  link: string;
  snippet: string;
  content: string;
  publishedAt: Date;
};

@Injectable()
export class RssNewsService {
  private readonly parser = new Parser();

  async fetchRecentItems(maxAgeDays = 3): Promise<RssNewsItem[]> {
    const feeds = this.resolveFeeds();
    const allItems: RssNewsItem[] = [];
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    for (const feedUrl of feeds) {
      const feed = await this.parser.parseURL(feedUrl).catch(() => null);
      if (!feed?.items) {
        continue;
      }

      const sourceName = feed.title?.trim() || this.resolveSourceName(feedUrl);
      const sourceUrl = feed.link?.trim() || feedUrl;

      for (const item of feed.items) {
        const title = this.cleanText(item.title);
        const link = this.cleanText(item.link);
        if (!link || !title) {
          continue;
        }

        const publishedAt = this.resolvePublishedAt(item);
        if (now - publishedAt.getTime() > maxAgeMs) {
          continue;
        }

        const snippet = this.cleanText(item.contentSnippet || item.summary || item.content || '');
        const content = this.cleanText(item.content || item.contentSnippet || item.summary || item.description || item.title || '');
        allItems.push({
          feedUrl,
          sourceName,
          sourceUrl,
          title,
          link,
          snippet,
          content,
          publishedAt,
        });
      }
    }

    return allItems
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 60);
  }

  private resolveFeeds(): string[] {
    const configured =
      process.env.NEWS_RSS_FEEDS?.split(',')
        .map((value) => value.trim())
        .filter(Boolean) ?? [];

    if (configured.length > 0) {
      return configured;
    }

    return [
      'https://govern.cat/rss/noticies.xml',
      'https://habitatge.gencat.cat/rss',
      'https://ajuntament.barcelona.cat/rss',
      'https://www.elperiodico.com/es/rss/rss_portada.xml',
      'https://www.lavanguardia.com/rss/home.xml',
      'https://www.ccma.cat/324/rss/',
      'https://www.ara.cat/rss/',
      'https://www.rubi.cat/rss',
      'https://www.terrassa.cat/rss',
      'https://www.sabadell.cat/rss',
      'https://www.santcugat.cat/rss',
      'https://www.idealista.com/news/rss',
      'https://www.fotocasa.es/blog/feed/',
    ];
  }

  private resolveSourceName(feedUrl: string) {
    const host = new URL(feedUrl).hostname;
    if (host.includes('govern.cat')) return 'Govern de Catalunya';
    if (host.includes('habitatge.gencat.cat')) return 'Habitatge Generalitat';
    if (host.includes('ajuntament.barcelona.cat')) return 'Ajuntament de Barcelona';
    if (host.includes('rubi.cat')) return 'Ajuntament de Rubí';
    if (host.includes('terrassa.cat')) return 'Ajuntament de Terrassa';
    if (host.includes('sabadell.cat')) return 'Ajuntament de Sabadell';
    if (host.includes('santcugat.cat')) return 'Ajuntament de Sant Cugat';
    return host.replace(/^www\./, '');
  }

  private resolvePublishedAt(item: any) {
    const rawDate = item.isoDate || item.pubDate || item.published || item.date;
    const parsed = rawDate ? new Date(rawDate) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private cleanText(value?: string | null) {
    return (value || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
