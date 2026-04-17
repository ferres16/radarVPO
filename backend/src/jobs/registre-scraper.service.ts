import { Injectable, Logger } from '@nestjs/common';
import { PromotionType } from '@prisma/client';
import * as cheerio from 'cheerio';
import { PrismaService } from '../prisma/prisma.service';

type NewsEntry = {
  title: string;
  detailUrl: string;
  publishedAt?: Date;
  isSixtyDayAlert: boolean;
  isAnnouncement: boolean;
};

@Injectable()
export class RegistreScraperService {
  private readonly logger = new Logger(RegistreScraperService.name);

  constructor(private readonly prisma: PrismaService) {}

  async scrapeLatestAnnouncements(): Promise<{
    scanned: number;
    promotionsCreated: number;
    documentsCreated: number;
    duplicatesMerged: number;
  }> {
    const listUrl =
      process.env.REGISTRE_NEWS_URL ??
      'https://www.registresolicitants.cat/registre/noticias/03_noticias.jsp';
    const maxPages = Number(process.env.REGISTRE_MAX_PAGES ?? 50);

    const source = await this.ensureSource();
    const entriesMap = new Map<string, NewsEntry>();
    let emptyPages = 0;

    for (let page = 1; page <= Math.max(1, maxPages); page += 1) {
      const pageUrl = this.buildNewsPageUrl(listUrl, page);
      const html = await this.fetchHtml(pageUrl);
      const pageEntries = this.parseNewsList(html, pageUrl);

      if (pageEntries.length === 0) {
        emptyPages += 1;
        if (emptyPages >= 2) {
          break;
        }
        continue;
      }

      emptyPages = 0;

      for (const entry of pageEntries) {
        const key = this.canonicalizeDetailUrl(entry.detailUrl);
        if (!entriesMap.has(key)) {
          entriesMap.set(key, {
            ...entry,
            detailUrl: key,
          });
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
      const publicationDate =
        entry.publishedAt ??
        this.extractDate(rawText);
      const estimatedFromAlert =
        entry.isSixtyDayAlert && publicationDate
          ? this.addDays(publicationDate, 60)
          : null;
      const status = entry.isSixtyDayAlert ? 'upcoming' : 'open';

      const promotion =
        existing ??
        (await this.prisma.promotion.create({
          data: {
            sourceId: source.id,
            title: this.sanitizeTitle(entry.title),
            sourceUrl: entry.detailUrl,
            rawText,
            status,
            promotionType: this.guessPromotionType(rawText),
            targetScope: 'catalunya',
            autonomousCommunity: 'Catalunya',
            publishedAt: publicationDate,
            estimatedPublicationDate: estimatedFromAlert,
            futureLaunch: entry.isSixtyDayAlert,
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
            publishedAt: publicationDate,
            estimatedPublicationDate: estimatedFromAlert,
            status,
            futureLaunch: entry.isSixtyDayAlert,
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

      if (entry.isAnnouncement && pdfLinks.length > 0) {
        await this.prisma.promotion.update({
          where: { id: promotion.id },
          data: { aiStatus: 'pending' },
        });
      }
    }

    const duplicatesMerged = await this.mergeDuplicates(source.id);

    return {
      scanned: entries.length,
      promotionsCreated,
      documentsCreated,
      duplicatesMerged,
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
    const seenUrls = new Set<string>();

    // The Registre list renders date and link in sibling divs: .notizd + .notdcha.
    $('.ContenidoGral')
      .find('div.notizd')
      .each((_, dateNode) => {
        const dateText = $(dateNode).text().trim();
        const publishedAt = this.extractDate(dateText);
        const detailContainer = $(dateNode).nextAll('div.notdcha').first();
        if (!detailContainer.length) {
          return;
        }

        const anchor = detailContainer.find('a').first();
        const href =
          anchor.attr('href') ??
          this.extractDetailFromOnclick(anchor.attr('onclick') ?? '');
        const titleText = anchor.text().trim() || detailContainer.text().trim();
        if (!href || !titleText) {
          return;
        }

        const detailUrl = this.resolveUrl(baseUrl, href);
        const canonicalUrl = this.canonicalizeDetailUrl(detailUrl);
        if (seenUrls.has(canonicalUrl)) {
          return;
        }

        const contextText = `${dateText}\n${detailContainer.text().trim()}`;
        const title =
          titleText
            .replace(/leer\s*m[aà]s|llegir\s*m[eé]s/gi, '')
            .trim()
            .slice(0, 220) || 'Anuncio HPO';

        entries.push({
          title,
          detailUrl,
          publishedAt,
          isSixtyDayAlert: this.looksLikeSixtyDayAlert(contextText),
          isAnnouncement: this.looksLikeAnnouncement(contextText),
        });
        seenUrls.add(canonicalUrl);
      });

    $('a').each((_, el) => {
      const href = $(el).attr('href') ?? this.extractDetailFromOnclick($(el).attr('onclick') ?? '');
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
      const canonicalUrl = this.canonicalizeDetailUrl(detailUrl);
      if (seenUrls.has(canonicalUrl)) {
        return;
      }
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
        isSixtyDayAlert: this.looksLikeSixtyDayAlert(`${title}\n${containerText}`),
        isAnnouncement: this.looksLikeAnnouncement(`${title}\n${containerText}`),
      });
      seenUrls.add(canonicalUrl);
    });

    return entries;
  }

  private buildNewsPageUrl(listUrl: string, page: number): string {
    try {
      const url = new URL(listUrl);
      url.searchParams.set('numpagactual', String(page));
      return url.toString();
    } catch {
      return listUrl;
    }
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

  private canonicalizeDetailUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const isDetailPage = /03_noticias_detalle\.jsp/i.test(parsed.pathname);
      const noticiaId = parsed.searchParams.get('idNoticia');

      if (isDetailPage && noticiaId) {
        parsed.search = `?idNoticia=${noticiaId}`;
        parsed.hash = '';
      }

      return parsed.toString();
    } catch {
      return url;
    }
  }

  private looksLikeSixtyDayAlert(text: string): boolean {
    const normalized = text.toLowerCase();
    return /60\s*d[ií]as|60\s*dies|seixanta\s*dies/.test(normalized);
  }

  private looksLikeAnnouncement(text: string): boolean {
    const normalized = text.toLowerCase();
    return /anunci|convocat[oò]ria|bases|adjudicaci[oó]|inscripci[oó]|sol[·\.]?licitud/.test(
      normalized,
    );
  }

  private extractDetailFromOnclick(onclick: string): string | null {
    const match = onclick.match(/03_noticias_detalle\.jsp\?idNoticia=\d+/i);
    return match ? match[0] : null;
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private duplicateKey(promotion: {
    sourceUrl: string;
    title: string;
    publishedAt: Date | null;
  }): string {
    const canonicalUrl = this.canonicalizeDetailUrl(promotion.sourceUrl);
    const title = this.sanitizeTitle(promotion.title).toLowerCase();
    const date = promotion.publishedAt
      ? promotion.publishedAt.toISOString().slice(0, 10)
      : 'no-date';
    return `${canonicalUrl}|${title}|${date}`;
  }

  private async mergeDuplicates(sourceId: string): Promise<number> {
    const promotions = await this.prisma.promotion.findMany({
      where: { sourceId },
      orderBy: [{ createdAt: 'asc' }],
      select: {
        id: true,
        sourceUrl: true,
        title: true,
        publishedAt: true,
      },
    });

    const keepByKey = new Map<string, string>();
    let merged = 0;

    for (const promotion of promotions) {
      const key = this.duplicateKey(promotion);
      const keeperId = keepByKey.get(key);

      if (!keeperId) {
        keepByKey.set(key, promotion.id);
        continue;
      }

      if (keeperId === promotion.id) {
        continue;
      }

      await this.mergePromotionInto(keeperId, promotion.id);
      merged += 1;
    }

    return merged;
  }

  private async mergePromotionInto(
    keeperId: string,
    duplicateId: string,
  ): Promise<void> {
    const docs = await this.prisma.promotionDocument.findMany({
      where: { promotionId: duplicateId },
      select: { id: true, documentUrl: true },
    });

    for (const doc of docs) {
      const exists = await this.prisma.promotionDocument.findFirst({
        where: {
          promotionId: keeperId,
          documentUrl: doc.documentUrl,
        },
        select: { id: true },
      });

      if (exists) {
        await this.prisma.promotionDocument.delete({ where: { id: doc.id } });
      } else {
        await this.prisma.promotionDocument.update({
          where: { id: doc.id },
          data: { promotionId: keeperId },
        });
      }
    }

    const favorites = await this.prisma.promotionFavorite.findMany({
      where: { promotionId: duplicateId },
      select: { id: true, userId: true },
    });

    for (const favorite of favorites) {
      const exists = await this.prisma.promotionFavorite.findUnique({
        where: {
          userId_promotionId: {
            userId: favorite.userId,
            promotionId: keeperId,
          },
        },
        select: { id: true },
      });

      if (exists) {
        await this.prisma.promotionFavorite.delete({
          where: { id: favorite.id },
        });
      } else {
        await this.prisma.promotionFavorite.update({
          where: { id: favorite.id },
          data: { promotionId: keeperId },
        });
      }
    }

    await this.prisma.promotionAiAnalysis.updateMany({
      where: { promotionId: duplicateId },
      data: { promotionId: keeperId },
    });

    await this.prisma.promotion.delete({ where: { id: duplicateId } });
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
