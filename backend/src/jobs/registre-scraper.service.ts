import { Injectable, Logger } from '@nestjs/common';
import { PromotionType } from '@prisma/client';
import * as cheerio from 'cheerio';
import { PrismaService } from '../prisma/prisma.service';

type NewsEntry = {
  title: string;
  detailUrl: string;
  publishedAt?: Date;
};

@Injectable()
export class RegistreScraperService {
  private readonly logger = new Logger(RegistreScraperService.name);

  constructor(private readonly prisma: PrismaService) {}

  async scrapeLatestAnnouncements(): Promise<{
    scanned: number;
    promotionsCreated: number;
    documentsCreated: number;
  }> {
    const listUrl =
      process.env.REGISTRE_NEWS_URL ??
      'https://www.registresolicitants.cat/registre/noticias/03_noticias.jsp';

    const source = await this.ensureSource();
    const listHtml = await this.fetchHtml(listUrl);
    const listingPages = this.collectListingPages(listHtml, listUrl);
    const entriesMap = new Map<string, NewsEntry>();

    for (const pageUrl of listingPages) {
      const html =
        pageUrl === listUrl ? listHtml : await this.fetchHtml(pageUrl);
      const pageEntries = this.parseNewsList(html, pageUrl);

      for (const entry of pageEntries) {
        if (!entriesMap.has(entry.detailUrl)) {
          entriesMap.set(entry.detailUrl, entry);
        }
      }
    }

    const entries = [...entriesMap.values()];

    let promotionsCreated = 0;
    let documentsCreated = 0;

    for (const entry of entries) {
      const existing = await this.prisma.promotion.findFirst({
        where: { sourceUrl: entry.detailUrl },
        select: { id: true },
      });

      const detailHtml = await this.fetchHtml(entry.detailUrl);
      const rawText = this.extractText(detailHtml);
      const pdfLinks = this.extractPdfLinks(detailHtml, entry.detailUrl);

      const promotion =
        existing ??
        (await this.prisma.promotion.create({
          data: {
            sourceId: source.id,
            title: this.sanitizeTitle(entry.title),
            sourceUrl: entry.detailUrl,
            rawText,
            status: 'open',
            promotionType: this.guessPromotionType(rawText),
            targetScope: 'catalunya',
            autonomousCommunity: 'Catalunya',
            publishedAt: entry.publishedAt,
            aiStatus: 'pending',
          },
          select: { id: true },
        }));

      if (!existing) {
        promotionsCreated += 1;
      } else {
        await this.prisma.promotion.update({
          where: { id: promotion.id },
          data: {
            rawText,
            aiStatus: 'pending',
            publishedAt: entry.publishedAt,
          },
        });
      }

      for (const link of pdfLinks) {
        const docExists = await this.prisma.promotionDocument.findFirst({
          where: {
            promotionId: promotion.id,
            documentUrl: link,
          },
          select: { id: true },
        });

        if (docExists) {
          continue;
        }

        await this.prisma.promotionDocument.create({
          data: {
            promotionId: promotion.id,
            documentUrl: link,
            fileType: 'pdf',
          },
        });
        documentsCreated += 1;
      }
    }

    return {
      scanned: entries.length,
      promotionsCreated,
      documentsCreated,
    };
  }

  private async ensureSource() {
    const baseUrl = 'https://www.registresolicitants.cat/registre';
    const existing = await this.prisma.source.findFirst({
      where: { baseUrl },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.source.create({
      data: {
        name: 'Registre Sol·licitants HPO',
        sourceType: 'official',
        baseUrl,
        active: true,
        scrapeConfig: {
          listUrl:
            process.env.REGISTRE_NEWS_URL ??
            'https://www.registresolicitants.cat/registre/noticias/03_noticias.jsp',
          language: 'ca-es',
        },
      },
    });
  }

  private parseNewsList(html: string, baseUrl: string): NewsEntry[] {
    const $ = cheerio.load(html);
    const entries: NewsEntry[] = [];

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();

      if (!href) {
        return;
      }

      const looksLikeReadMore = /leer\s*m[aà]s|llegir\s*m[eé]s/i.test(text);
      const looksLikeDetail =
        /03_noticias_detalle\.jsp/i.test(href) || /idNoticia=\d+/i.test(href);

      if (!looksLikeReadMore && !looksLikeDetail) {
        return;
      }

      const detailUrl = this.resolveUrl(baseUrl, href);
      const containerText =
        $(el).closest('tr, li, div, article, p').text().trim() || text;
      const title =
        containerText
          .replace(/leer\s*m[aà]s|llegir\s*m[eé]s/gi, '')
          .trim()
          .slice(0, 220) || 'Anuncio HPO';
      const publishedAt = this.extractDate(containerText);

      entries.push({
        title,
        detailUrl,
        publishedAt,
      });
    });

    return entries;
  }

  private collectListingPages(html: string, listUrl: string): string[] {
    const maxPages = Number(process.env.REGISTRE_MAX_PAGES ?? 2);
    const $ = cheerio.load(html);
    const pages = new Set<string>([listUrl]);

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();

      if (!href) {
        return;
      }

      const isPagination = /^\d+$/.test(text) || /sig\.?/i.test(text);
      const looksLikeListPage = /03_noticias\.jsp/i.test(href);

      if (!isPagination || !looksLikeListPage) {
        return;
      }

      pages.add(this.resolveUrl(listUrl, href));
    });

    return [...pages].slice(0, Math.max(1, maxPages));
  }

  private extractPdfLinks(html: string, pageUrl: string): string[] {
    const $ = cheerio.load(html);
    const links = new Set<string>();

    $('a, area, iframe, embed').each((_, el) => {
      const href = $(el).attr('href') ?? $(el).attr('src');
      const onclick = $(el).attr('onclick') ?? '';

      if (href && /\.pdf(\?|$)/i.test(href)) {
        links.add(this.resolveUrl(pageUrl, href));
      }

      const onclickMatches = onclick.matchAll(
        /(['"])(https?:\/\/[^'"\s]+\.pdf|\/[^'"\s]+\.pdf)[^'"\s]*\1/gi,
      );
      for (const match of onclickMatches) {
        const candidate = match[2];
        if (candidate) {
          links.add(this.resolveUrl(pageUrl, candidate));
        }
      }
    });

    return [...links.values()];
  }

  private extractText(html: string): string {
    const $ = cheerio.load(html);
    $('script, style, noscript').remove();

    return $('body')
      .text()
      .replace(/\r/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 60000);
  }

  private extractDate(text: string): Date | undefined {
    const match = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) {
      return undefined;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const minYear = Number(process.env.REGISTRE_MIN_YEAR ?? 2020);
    if (year < minYear) {
      return undefined;
    }

    const parsed = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  private guessPromotionType(text: string): PromotionType {
    const normalized = text.toLowerCase();
    if (/alquiler|lloguer/.test(normalized)) {
      return 'alquiler';
    }
    if (/venta|venda/.test(normalized)) {
      return 'venta';
    }
    if (/mixto|mixt/.test(normalized)) {
      return 'mixto';
    }

    return 'desconocido';
  }

  private sanitizeTitle(title: string): string {
    return title
      .replace(/\s+/g, ' ')
      .replace(/^[-:;,.\s]+/, '')
      .trim()
      .slice(0, 220);
  }

  private resolveUrl(baseUrl: string, path: string): string {
    try {
      return new URL(path, baseUrl).toString();
    } catch {
      return path;
    }
  }

  private async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'RadarVPOBot/1.0 (+https://www.registresolicitants.cat/registre/)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed fetch ${url} (${response.status})`);
    }

    const bytes = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') ?? '';
    const charsetMatch = contentType.match(/charset=([^;]+)/i);
    const charset = charsetMatch?.[1]?.trim().toLowerCase() ?? 'utf-8';

    try {
      if (charset.includes('iso-8859-1') || charset.includes('latin1')) {
        return new TextDecoder('iso-8859-1').decode(bytes);
      }
      return new TextDecoder('utf-8').decode(bytes);
    } catch (error) {
      this.logger.warn(
        `Charset decode fallback for ${url}: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
      return new TextDecoder('utf-8').decode(bytes);
    }
  }
}
