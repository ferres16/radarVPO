import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { sha256 } from './hash.util';
import { RssNewsService, RssNewsItem } from './rss-news.service';
import { AiProviderService, GeneratedNewsDraft } from '../ai/ai.provider.service';

const CATEGORY_PRIORITY: Record<GeneratedNewsDraft['category'], number> = {
  vpo: 40,
  alquiler: 34,
  ayudas: 30,
  normativa: 24,
  general: 18,
};

const CATALONIA_KEYWORDS = [
  'catalunya',
  'cataluna',
  'barcelona',
  'girona',
  'lleida',
  'tarragona',
  'generalitat',
  'incasol',
  'ajuntament',
  'habitatge',
  'vivienda',
];

const MANDATORY_KEYWORDS = [
  'vivienda',
  'vpo',
  'alquiler',
  'habitatge',
  'promoción',
  'promocion',
  'adjudicación',
  'adjudicacion',
  'ayudas',
  'registro solicitantes',
  'registre solicitants',
];

const BOOST_KEYWORDS = [
  'sorteo',
  'promoción pública',
  'promocion publica',
  'viviendas protegidas',
  'vivienda protegida',
  'precio alquiler',
  'irsc',
  'generalitat',
];

@Injectable()
export class NewsAutomationService {
  private readonly logger = new Logger(NewsAutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rssNewsService: RssNewsService,
    private readonly aiProvider: AiProviderService,
  ) {}

  async generateDailyCatalunyaNews() {
    const today = new Date().toISOString().slice(0, 10);
    const lastRun = await this.prisma.systemSetting.findUnique({
      where: { key: 'news.last_generated_day' },
      select: { value: true },
    });

    if (this.settingDate(lastRun?.value) === today) {
      return { inserted: 0, cached: 0, selected: 0, reason: 'already_generated_today' };
    }

    await this.purgeLegacyNewsOnce();

    const rawItems = await this.rssNewsService.fetchRecentItems(3);
    const cachedItems = await this.cacheRawItems(rawItems);
    const rankedCandidates = this.rankCandidates(cachedItems);

    const topCandidates = this.selectTopCandidates(rankedCandidates, 5);
    if (topCandidates.length === 0) {
      return { inserted: 0, cached: cachedItems.length, selected: 0, reason: 'no_relevant_items' };
    }

    const recentNews = await this.prisma.newsItem.findMany({
      where: {
        publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { title: true, category: true, municipality: true, topic: true },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    const editorialCandidates = this.selectEditorialCandidates(topCandidates, recentNews).slice(0, 5);
    if (editorialCandidates.length === 0) {
      return { inserted: 0, cached: cachedItems.length, selected: 0, reason: 'all_recently_used' };
    }

    const candidatesForAi = editorialCandidates.map((item) => ({
      ...item,
      sourceItemId: item.id,
    }));

    const aiDrafts =
      (await this.aiProvider.generateHousingNewsArticles(candidatesForAi, 2).catch((error) => {
        this.logger.warn(`Falling back to local generation: ${error instanceof Error ? error.message : 'unknown'}`);
        return null;
      })) ?? this.buildFallbackDrafts(candidatesForAi, 2);

    const inserted = await this.persistDrafts(aiDrafts, candidatesForAi);
    return {
      inserted,
      cached: cachedItems.length,
      selected: candidatesForAi.length,
    };
  }

  private async purgeLegacyNewsOnce() {
    const markerKey = 'news.legacy-purged-v1';
    const marker = await this.prisma.systemSetting.findUnique({
      where: { key: markerKey },
      select: { id: true },
    });

    if (marker) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.newsItem.deleteMany({}),
      this.prisma.newsFeedItem.deleteMany({}),
      this.prisma.systemSetting.create({
        data: {
          key: markerKey,
          value: { purgedAt: new Date().toISOString() },
        },
      }),
    ]);
  }

  private async cacheRawItems(items: RssNewsItem[]) {
    const cached: Array<RssNewsItem & {
      id: string;
      category: GeneratedNewsDraft['category'];
      score: number;
      matchedKeywords: string[];
      municipality: string;
    }> = [];

    for (const item of items) {
      const fingerprint = sha256([
        item.feedUrl,
        item.sourceName,
        item.sourceUrl,
        item.link,
        item.title,
        item.publishedAt.toISOString(),
      ].join('|'));

      const { category, score, matchedKeywords, municipality } = this.scoreItem(item);

      const row = await this.prisma.newsFeedItem.upsert({
        where: { contentHash: fingerprint },
        create: {
          contentHash: fingerprint,
          feedUrl: item.feedUrl,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          publishedAt: item.publishedAt,
          category,
          relevanceScore: score,
          matchedKeywords: matchedKeywords as Prisma.InputJsonValue,
        },
        update: {
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          publishedAt: item.publishedAt,
          category,
          relevanceScore: score,
          matchedKeywords: matchedKeywords as Prisma.InputJsonValue,
        },
      });

      cached.push({
        ...item,
        id: row.id,
        category,
        score,
        matchedKeywords,
        municipality,
      });
    }

    return cached;
  }

  private rankCandidates(
    items: Array<RssNewsItem & {
      id: string;
      category: GeneratedNewsDraft['category'];
      score: number;
      matchedKeywords: string[];
      municipality: string;
    }>,
  ) {
    return items
      .filter((item) => item.score >= 20)
      .sort((a, b) => b.score - a.score || b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  private selectTopCandidates(
    items: Array<RssNewsItem & {
      id: string;
      category: GeneratedNewsDraft['category'];
      score: number;
      matchedKeywords: string[];
      municipality: string;
    }>,
    maxItems: number,
  ) {
    const chosen: typeof items = [];
    const usedCategories = new Set<GeneratedNewsDraft['category']>();

    for (const item of items) {
      if (chosen.length >= maxItems) {
        break;
      }

      if (usedCategories.has(item.category) && chosen.length >= 3) {
        continue;
      }

      if (!this.hasCataloniaContext(item.title, item.snippet)) {
        continue;
      }

      chosen.push(item);
      usedCategories.add(item.category);
    }

    return chosen;
  }

  private selectEditorialCandidates(
    items: Array<RssNewsItem & {
      id: string;
      category: GeneratedNewsDraft['category'];
      score: number;
      matchedKeywords: string[];
      municipality: string;
    }>,
    recentNews: Array<{ title: string; category: string | null; municipality: string | null; topic: string | null }>,
  ) {
    const recentFingerprints = new Set(
      recentNews.map((news) => this.topicFingerprint(news.category || 'general', news.municipality || '', news.title)),
    );

    const chosen: typeof items = [];
    const usedCategories = new Set<GeneratedNewsDraft['category']>();

    for (const item of items) {
      if (chosen.length >= 5) {
        break;
      }

      const fingerprint = this.topicFingerprint(item.category, item.municipality, item.title);
      if (recentFingerprints.has(fingerprint)) {
        continue;
      }

      if (usedCategories.has(item.category) && chosen.length >= 2) {
        continue;
      }

      chosen.push(item);
      usedCategories.add(item.category);
    }

    return chosen;
  }

  private scoreItem(item: RssNewsItem) {
    const combined = `${item.title}\n${item.snippet}\n${item.content}`.toLowerCase();
    const matchedKeywords = [
      ...MANDATORY_KEYWORDS.filter((keyword) => combined.includes(keyword)),
      ...BOOST_KEYWORDS.filter((keyword) => combined.includes(keyword)),
    ];

    if (!matchedKeywords.some((keyword) => MANDATORY_KEYWORDS.includes(keyword))) {
      return { category: 'general' as const, score: 0, matchedKeywords: [], municipality: 'Catalunya' };
    }

    const category = this.classifyCategory(combined);
    const municipality = this.detectMunicipality(combined, item.sourceName, item.sourceUrl);
    const recencyScore = this.recencyScore(item.publishedAt);
    const baseScore = CATEGORY_PRIORITY[category];
    const keywordScore = matchedKeywords.reduce((total, keyword) => {
      if (BOOST_KEYWORDS.includes(keyword)) {
        return total + 4;
      }
      return total + 3;
    }, 0);
    const cataloniaScore = this.hasCataloniaContext(item.title, item.snippet) ? 10 : 0;

    return {
      category,
      score: baseScore + keywordScore + recencyScore + cataloniaScore,
      matchedKeywords: Array.from(new Set(matchedKeywords)),
      municipality,
    };
  }

  private classifyCategory(text: string): GeneratedNewsDraft['category'] {
    if (/vpo|vivienda protegida|viviendas protegidas|hpo|promoci[oó]n p[uú]blica/.test(text)) {
      return 'vpo';
    }
    if (/alquiler|lloguer|asequible|precio alquiler|renta asequible/.test(text)) {
      return 'alquiler';
    }
    if (/ayuda|subvenci[oó]n|bono|prestaci[oó]n|irsc|registro solicitantes|registre solicitants/.test(text)) {
      return 'ayudas';
    }
    if (/normativa|decreto|ley|reglamento|modificaci[oó]n|tramites?/.test(text)) {
      return 'normativa';
    }
    return 'general';
  }

  private detectMunicipality(text: string, sourceName: string, sourceUrl: string) {
    const sourceLower = sourceName.toLowerCase();
    const urlLower = sourceUrl.toLowerCase();

    if (/sant cugat/.test(text) || urlLower.includes('santcugat') || sourceLower.includes('sant cugat')) {
      return 'Sant Cugat del Vallès';
    }
    if (/terrassa/.test(text) || urlLower.includes('terrassa') || sourceLower.includes('terrassa')) {
      return 'Terrassa';
    }
    if (/sabadell/.test(text) || urlLower.includes('sabadell') || sourceLower.includes('sabadell')) {
      return 'Sabadell';
    }
    if (/rubi|rubí/.test(text) || urlLower.includes('rubi') || sourceLower.includes('rubi')) {
      return 'Rubí';
    }
    if (/barcelona/.test(text) || urlLower.includes('barcelona') || sourceLower.includes('barcelona')) {
      return 'Barcelona';
    }
    return 'Catalunya';
  }

  private hasCataloniaContext(title: string, snippet: string) {
    const text = `${title}\n${snippet}`.toLowerCase();
    return CATALONIA_KEYWORDS.some((keyword) => text.includes(keyword));
  }

  private recencyScore(publishedAt: Date) {
    const ageDays = Math.max(0, (Date.now() - publishedAt.getTime()) / (24 * 60 * 60 * 1000));
    if (ageDays <= 1) return 12;
    if (ageDays <= 2) return 8;
    if (ageDays <= 3) return 4;
    return 0;
  }

  private topicFingerprint(category: string, municipality: string, title: string) {
    const normalizedTitle = title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const keyWords = normalizedTitle.split(' ').filter((word) => word.length > 3).slice(0, 8).join('-');
    return [category, municipality.toLowerCase(), keyWords].join('|');
  }

  private buildFallbackDrafts(
    candidates: Array<RssNewsItem & {
      id: string;
      category: GeneratedNewsDraft['category'];
      score: number;
      matchedKeywords: string[];
      municipality: string;
    }>,
    maxArticles: number,
  ): GeneratedNewsDraft[] {
    return candidates.slice(0, maxArticles).map((candidate, index) => {
      const intro = this.takeSentences(candidate.snippet || candidate.content || candidate.title, 2);
      const context = this.takeSentences(candidate.content || candidate.snippet || candidate.title, 4);
      const title = this.enhanceTitle(candidate.title, candidate.category, candidate.municipality);
      const summary = `${intro} Esta es la clave para quien sigue convocatorias de vivienda en Catalunya.`;
      const content = [
        `${summary}`,
        `La noticia parte de ${candidate.sourceName} y afecta especialmente a personas que buscan VPO, alquiler asequible o ayudas de vivienda en ${candidate.municipality}.`,
        `En la práctica, lo importante no es solo el anuncio, sino qué cambia en plazos, requisitos, baremos o disponibilidad. ${context}`,
        `Si estás esperando una convocatoria concreta, revisa empadronamiento, ingresos, documentación y fechas oficiales. En vivienda pública, un pequeño detalle puede dejar fuera una solicitud aunque encaje en teoría.`,
        `Conviene seguir la publicación original y comparar esta novedad con procesos anteriores del mismo municipio para detectar si hay más plazas, nuevas reservas o cambios de acceso.`,
      ].join('\n\n');

      return {
        sourceItemId: candidate.id,
        title,
        summary,
        content: this.ensureWordTarget(content),
        category: candidate.category,
        municipality: candidate.municipality,
        isFeatured: index === 0 || candidate.category === 'vpo',
      };
    });
  }

  private ensureWordTarget(text: string) {
    const currentWords = this.wordCount(text);
    if (currentWords >= 250 && currentWords <= 300) {
      return text;
    }

    if (currentWords > 300) {
      return text
        .split(/\s+/)
        .slice(0, 300)
        .join(' ')
        .trim();
    }

    const padding = [
      'La lectura de bases sigue siendo la parte más útil para no perder oportunidades.',
      'Cuando aparezcan listados provisionales o rectificaciones, conviene revisar el detalle antes de dejar pasar el plazo.',
      'Este tipo de avisos suele tener más impacto práctico que el titular inicial porque marca si debes moverte ya o esperar.',
    ].join(' ');

    return `${text} ${padding}`.trim();
  }

  private enhanceTitle(title: string, category: GeneratedNewsDraft['category'], municipality: string) {
    const prefix =
      category === 'vpo'
        ? 'Nuevas VPO'
        : category === 'alquiler'
          ? 'Alquiler asequible'
          : category === 'ayudas'
            ? 'Ayudas de vivienda'
            : category === 'normativa'
              ? 'Normativa de vivienda'
              : 'Vivienda en Catalunya';
    return `${prefix} en ${municipality}: ${title}`.slice(0, 220);
  }

  private takeSentences(text: string, count: number) {
    return text
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
      .slice(0, count)
      .join(' ')
      .trim();
  }

  private wordCount(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  private extractPracticalImpact(content: string) {
    const firstSentence = this.takeSentences(content, 1);
    return firstSentence.length > 180 ? firstSentence.slice(0, 180).trim() : firstSentence;
  }

  private async persistDrafts(
    drafts: GeneratedNewsDraft[],
    candidates: Array<RssNewsItem & {
      id: string;
      category: GeneratedNewsDraft['category'];
      score: number;
      matchedKeywords: string[];
      municipality: string;
    }>,
  ) {
    let inserted = 0;

    for (const draft of drafts.slice(0, 2)) {
      const source = candidates.find((candidate) => candidate.id === draft.sourceItemId);
      if (!source) {
        continue;
      }

      const slug = this.buildSlug(draft.title, source.id);
      const contentHash = sha256([slug, draft.title, draft.summary, draft.content].join('|'));

      const existing = await this.prisma.newsItem.findFirst({
        where: {
          OR: [{ contentHash }, { slug }],
        },
        select: { id: true },
      });

      if (existing) {
        await this.prisma.newsFeedItem.update({
          where: { id: source.id },
          data: { selectedAt: new Date() },
        });
        continue;
      }

      await this.prisma.newsItem.create({
        data: {
          slug,
          sourceName: source.sourceName,
          sourceUrl: source.sourceUrl,
          itemUrl: source.link,
          title: draft.title,
          rawText: source.content,
          summary: draft.summary,
          body: draft.content,
          practicalImpact: this.extractPracticalImpact(draft.content),
          relevance: source.score >= 42 ? 'high' : source.score >= 32 ? 'medium' : 'low',
          category: draft.category,
          topic: `${draft.category}_${source.municipality.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
          municipality: source.municipality,
          contentHash,
          publishedAt: source.publishedAt,
        } as Prisma.NewsItemCreateInput,
      });

      await this.prisma.newsFeedItem.update({
        where: { id: source.id },
        data: { selectedAt: new Date() },
      });

      inserted += 1;
    }

    await this.prisma.systemSetting.upsert({
      where: { key: 'news.last_generated_day' },
      create: {
        key: 'news.last_generated_day',
        value: { date: new Date().toISOString().slice(0, 10) },
      },
      update: {
        value: { date: new Date().toISOString().slice(0, 10) },
      },
    });

    return inserted;
  }

  private buildSlug(title: string, suffix: string) {
    const base = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);

    return `${base}-${suffix.slice(0, 8)}`;
  }

  private settingDate(value: Prisma.JsonValue | null | undefined) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    const dateValue = value['date'];
    return typeof dateValue === 'string' ? dateValue : null;
  }
}
