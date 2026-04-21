import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RssNewsService } from './rss-news.service';
import { sha256 } from './hash.util';
import { RegistreScraperService } from './registre-scraper.service';

const inMemoryLocks = new Set<string>();

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rssNewsService: RssNewsService,
    private readonly registreScraperService: RegistreScraperService,
  ) {}

  @Cron(process.env.CRON_CHECK_PROMOTIONS || CronExpression.EVERY_30_MINUTES, {
    timeZone: process.env.JOB_TIMEZONE || 'Europe/Madrid',
  })
  async checkPromotions() {
    await this.runWithLock('check_promotions', async () => {
      const count = await this.prisma.source.count({ where: { active: true } });
      const registre = await this.registreScraperService
        .scrapeLatestAnnouncements()
        .catch(async (error) => {
          await this.recordFailure('check_promotions', 'registre', error);
          return {
            scanned: 0,
            promotionsCreated: 0,
            documentsCreated: 0,
            duplicatesMerged: 0,
          };
        });

      this.logger.log(
        `Checked active sources=${count}; registre scanned=${registre.scanned}, created=${registre.promotionsCreated}, docs=${registre.documentsCreated}, merged=${registre.duplicatesMerged}`,
      );

      return {
        checkedSources: count,
        registre,
      };
    });
  }

  @Cron(process.env.CRON_FETCH_DAILY_NEWS || CronExpression.EVERY_DAY_AT_6AM, {
    timeZone: process.env.JOB_TIMEZONE || 'Europe/Madrid',
  })
  async fetchDailyNews() {
    await this.runWithLock('fetch_daily_news', async () => {
      const enabled = (process.env.NEWS_ENABLED ?? 'true') === 'true';
      if (!enabled) {
        return { inserted: 0, reason: 'disabled' };
      }

      const maxItems = Number(process.env.DAILY_NEWS_MAX_ITEMS ?? 10);
      const items = await this.rssNewsService.fetchDailyItems(maxItems);
      let inserted = 0;

      for (const item of items) {
        const hash = sha256(`${item.title}|${item.link}|${item.content}`);
        const existing = await this.prisma.newsItem.findUnique({
          where: { contentHash: hash },
          select: { id: true },
        });

        if (existing) {
          continue;
        }

        const enriched = this.buildCatalunyaHousingStory(item);
        if (!enriched) {
          continue;
        }

        await this.prisma.newsItem.create({
          data: {
            title: enriched.title,
            sourceName: item.sourceName,
            sourceUrl: item.sourceUrl,
            itemUrl: item.link,
            publishedAt: item.publishedAt,
            rawText: item.content,
            summary: enriched.summary,
            body: enriched.body,
            practicalImpact: enriched.practicalImpact,
            relevance: enriched.relevance,
            topic: enriched.topic,
            contentHash: hash,
          },
        });
        inserted += 1;
      }

      return { inserted, fetched: items.length };
    });
  }

  @Cron(
    process.env.CRON_PUBLISH_EDUCATIONAL_POST ||
      CronExpression.EVERY_DAY_AT_7AM,
    {
      timeZone: process.env.JOB_TIMEZONE || 'Europe/Madrid',
    },
  )
  async publishEducationalPost() {
    await this.runWithLock('publish_educational_post', async () => {
      const topic = await this.prisma.educationalTopic.findFirst({
        where: { active: true },
      });

      if (!topic) {
        return { published: 0 };
      }

      await this.prisma.educationalPost.create({
        data: {
          topicId: topic.id,
          title: `Guia: ${topic.title}`,
          body: 'Consejos practicos para inscripcion en VPO y lectura de bases.',
          publishedAt: new Date(),
        },
      });

      return { published: 1 };
    });
  }

  private buildCatalunyaHousingStory(item: {
    title: string;
    content: string;
    sourceName: string;
    link: string;
  }): {
    title: string;
    summary: string;
    body: string;
    practicalImpact: string;
    relevance: string;
    topic: string;
  } | null {
    const combined = `${item.title}\n${item.content}`.toLowerCase();

    const hasCatalunyaFocus =
      /catalunya|cataluna|barcelona|girona|lleida|tarragona|generalitat|incasol|ajuntament/.test(
        combined,
      );
    const hasHousingFocus =
      /vpo|hpo|habitatge|vivienda|lloguer|alquiler|asequible|solicitants|registre|ayuda|bono/.test(
        combined,
      );

    if (!hasCatalunyaFocus || !hasHousingFocus) {
      return null;
    }

    const topic = this.detectTopic(combined);
    const relevance = this.detectRelevance(combined);

    const hook =
      topic === 'promociones_publicas'
        ? 'Nuevas oportunidades de vivienda publica en Catalunya'
        : topic === 'ayudas_vivienda'
          ? 'Cambios en ayudas de vivienda que pueden mejorar tu acceso'
          : topic === 'normativa'
            ? 'Nueva normativa de vivienda en Catalunya: lo que cambia para solicitantes'
            : 'Actualizacion clave para quienes buscan vivienda asequible en Catalunya';

    const title = `${hook}: ${item.title}`.slice(0, 220);

    const cleaned = item.content.replace(/\s+/g, ' ').trim();
    const baseParagraph = cleaned.slice(0, 600);

    const summary = [
      'Contexto:',
      `${item.sourceName} publica una novedad vinculada a vivienda en Catalunya.`,
      baseParagraph || 'Se han anunciado cambios con impacto directo en procesos de acceso a vivienda protegida.',
    ].join(' ');

    const practicalImpact =
      'Impacto practico: revisa requisitos de ingresos, empadronamiento, plazos y canales de solicitud porque estos elementos suelen cambiar entre convocatorias y pueden dejarte fuera si presentas documentacion incompleta.';

    const body = [
      `Por que importa: esta informacion esta orientada a personas inscritas o interesadas en VPO, alquiler asequible y convocatorias publicas en Catalunya.`,
      `Que ha pasado: ${baseParagraph || 'se han comunicado novedades relevantes para el acceso a vivienda publica.'}`,
      `Que debes vigilar ahora: fecha de apertura, fecha limite, municipio, promotora, documentacion exigida y posibles cupos de reserva.`,
      `Recomendacion: compara esta novedad con convocatorias recientes del mismo municipio para anticipar cambios de baremacion y preparar mejor tu solicitud.`,
      practicalImpact,
    ].join('\n\n');

    return {
      title,
      summary,
      body,
      practicalImpact,
      relevance,
      topic,
    };
  }

  private detectTopic(text: string): string {
    if (/promocion|convocatoria|adjudicacion|incasol|obra nueva|viviendas?/.test(text)) {
      return 'promociones_publicas';
    }
    if (/ayuda|subvencion|bono|prestacion|alquiler joven/.test(text)) {
      return 'ayudas_vivienda';
    }
    if (/decreto|ley|normativa|reglamento|modificacion/.test(text)) {
      return 'normativa';
    }
    if (/registre|solicitants|inscripcion|empadronamiento/.test(text)) {
      return 'registro_solicitantes';
    }
    return 'vivienda_catalunya';
  }

  private detectRelevance(text: string): string {
    const score = [
      /catalunya|generalitat|incasol/.test(text),
      /vpo|hpo|vivienda protegida|habitatge protegit/.test(text),
      /plazo|convocatoria|adjudicacion|solicitud/.test(text),
    ].filter(Boolean).length;

    if (score >= 3) {
      return 'high';
    }
    if (score === 2) {
      return 'medium';
    }
    return 'low';
  }

  private async runWithLock(
    jobName: string,
    execute: () => Promise<Record<string, unknown>>,
  ) {
    if (inMemoryLocks.has(jobName)) {
      this.logger.warn(`Job skipped by in-memory lock: ${jobName}`);
      return;
    }

    const running = await this.prisma.jobRun.findFirst({
      where: {
        jobName,
        status: 'running',
        startedAt: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    if (running) {
      this.logger.warn(`Job skipped by DB lock: ${jobName}`);
      return;
    }

    inMemoryLocks.add(jobName);
    const run = await this.prisma.jobRun.create({
      data: {
        jobName,
        status: 'running',
        startedAt: new Date(),
      },
    });

    try {
      const result = await execute();
      await this.prisma.jobRun.update({
        where: { id: run.id },
        data: {
          status: 'success',
          finishedAt: new Date(),
          resultJson: result as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      await this.prisma.jobRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'unknown',
        },
      });

      await this.recordFailure(jobName, run.id, error);
    } finally {
      inMemoryLocks.delete(jobName);
    }
  }

  private async recordFailure(jobName: string, ref: string, error: unknown) {
    await this.prisma.deliveryFailure.create({
      data: {
        channel: 'internal',
        target: jobName,
        sourceRef: ref,
        errorCode: 'JOB_EXECUTION_ERROR',
        errorDetail:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : { message: 'unknown' },
      },
    });
  }
}
