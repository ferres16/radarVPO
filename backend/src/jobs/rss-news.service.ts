import { Injectable } from '@nestjs/common';
import Parser from 'rss-parser';

type ParsedNewsItem = {
  title: string;
  link: string;
  sourceName: string;
  sourceUrl: string;
  content: string;
  publishedAt: Date;
};

@Injectable()
export class RssNewsService {
  private readonly parser = new Parser();

  async fetchDailyItems(maxItems = 10): Promise<ParsedNewsItem[]> {
    const feeds = this.resolveFeeds();
    const allItems: ParsedNewsItem[] = [];

    for (const feedUrl of feeds) {
      const feed = await this.parser.parseURL(feedUrl).catch(() => null);
      if (!feed?.items) {
        continue;
      }

      for (const item of feed.items.slice(0, maxItems)) {
        if (!item.link || !item.title) {
          continue;
        }

        const content =
          item.contentSnippet || item.content || item.summary || item.title;
        allItems.push({
          title: item.title,
          link: item.link,
          sourceName: feed.title || 'RSS Source',
          sourceUrl: feed.link || feedUrl,
          content,
          publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
        });
      }
    }

    return allItems
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, maxItems);
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
      'https://www.gencat.cat/feeds/premsa.xml',
      'https://ajuntament.barcelona.cat/rss.xml',
    ];
  }
}
