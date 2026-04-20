import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PdfOcrService } from './pdf-ocr.service';
import { StructuredExtractionService } from './structured-extraction.service';
import { RssNewsService } from './rss-news.service';
import { sha256 } from './hash.util';
import { RegistreScraperService } from './registre-scraper.service';

const inMemoryLocks = new Set<string>();

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfOcrService: PdfOcrService,
    private readonly extractionService: StructuredExtractionService,
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
        `Checked active sources: ${count}. Registre scanned=${registre.scanned}, promotionsCreated=${registre.promotionsCreated}, documentsCreated=${registre.documentsCreated}, duplicatesMerged=${registre.duplicatesMerged}`,
      );

      return {
        checkedSources: count,
        registre,
      };
    });
  }

  @Cron(process.env.CRON_PROCESS_PDFS || CronExpression.EVERY_30_MINUTES, {
    timeZone: process.env.JOB_TIMEZONE || 'Europe/Madrid',
  })
  async processPendingPdfs() {
    await this.runWithLock('process_pending_pdfs', async () => {
      const pending = await this.prisma.promotionDocument.findMany({
        where: { processedAt: null },
        include: { promotion: true },
        take: 25,
      });

      for (const doc of pending) {
        try {
          const parsed = await this.pdfOcrService.parseDocument(
            doc.documentUrl,
            doc.fileType,
          );

          await this.prisma.promotionDocument.update({
            where: { id: doc.id },
            data: {
              extractedText: parsed.text,
              processedAt: new Date(),
            },
          });

          if (parsed.text.length > 0) {
            const joined = [doc.promotion.rawText, parsed.text]
              .filter(Boolean)
              .join('\n\n');
            await this.prisma.promotion.update({
              where: { id: doc.promotionId },
              data: {
                rawText: joined.slice(0, 60000),
                aiStatus: 'pending',
              },
            });
          }
        } catch (error) {
          await this.recordFailure('process_pending_pdfs', doc.id, error);
        }
      }

      return { processed: pending.length };
    });
  }

  @Cron(process.env.CRON_ANALYZE_PROMOTIONS || CronExpression.EVERY_HOUR, {
    timeZone: process.env.JOB_TIMEZONE || 'Europe/Madrid',
  })
  async analyzePendingPromotions() {
    await this.runWithLock('analyze_pending_promotions', async () => {
      const pending = await this.prisma.promotion.findMany({
        where: { aiStatus: 'pending' },
        include: {
          documents: true,
        },
        take: 25,
      });

      for (const promotion of pending) {
        try {
          let sourceText = [
            promotion.rawText ?? '',
            ...promotion.documents
              .map((doc) => doc.extractedText ?? '')
              .filter((value) => value.trim().length > 0),
          ]
            .join('\n\n')
            .trim();

          if (
            this.needsHousingTableRefresh(sourceText) &&
            promotion.documents.length > 0
          ) {
            for (const document of promotion.documents) {
              if (!/pdf/i.test(document.fileType)) {
                continue;
              }

              try {
                const reparsed = await this.pdfOcrService.parseDocument(
                  document.documentUrl,
                  document.fileType,
                  { preferTableOcr: true },
                );

                if (reparsed.text.length > (document.extractedText?.length ?? 0)) {
                  await this.prisma.promotionDocument.update({
                    where: { id: document.id },
                    data: {
                      extractedText: reparsed.text,
                      processedAt: new Date(),
                    },
                  });
                  document.extractedText = reparsed.text;
                }
              } catch (error) {
                await this.recordFailure(
                  'analyze_pending_promotions',
                  document.id,
                  error,
                );
              }
            }

            sourceText = [
              promotion.rawText ?? '',
              ...promotion.documents
                .map((doc) => doc.extractedText ?? '')
                .filter((value) => value.trim().length > 0),
            ]
              .join('\n\n')
              .trim();
          }

          const analysis = await this.extractionService.extractPromotionData(
            sourceText,
            promotion.sourceUrl,
            promotion.documents.find((doc) => /pdf/i.test(doc.fileType))
              ?.documentUrl,
          );

          await this.prisma.promotionAiAnalysis.create({
            data: {
              promotionId: promotion.id,
              model: `${analysis.provider}:${analysis.model}`,
              resultJson: analysis.result as Prisma.InputJsonValue,
              confidence: analysis.confidence,
            },
          });

          const extractedPromotion =
            (analysis.result.promotion as
              | Record<string, unknown>
              | undefined) ?? {};
          const estimatedDate = extractedPromotion.estimated_publication_date;
          const isFutureLaunch =
            typeof extractedPromotion.future_launch === 'boolean'
              ? extractedPromotion.future_launch
              : false;

          const parsedDate =
            typeof estimatedDate === 'string' &&
            !Number.isNaN(Date.parse(estimatedDate))
              ? new Date(estimatedDate)
              : null;

          await this.prisma.promotion.update({
            where: { id: promotion.id },
            data: {
              aiStatus: 'done',
              futureLaunch: isFutureLaunch,
              status: isFutureLaunch ? 'upcoming' : promotion.status,
              estimatedPublicationDate:
                isFutureLaunch && parsedDate
                  ? parsedDate
                  : promotion.estimatedPublicationDate,
            },
          });
        } catch (error) {
          await this.recordFailure(
            'analyze_pending_promotions',
            promotion.id,
            error,
          );
          await this.prisma.promotion.update({
            where: { id: promotion.id },
            data: { aiStatus: 'failed' },
          });
        }
      }

      return { analyzed: pending.length };
    });
  }

  private needsHousingTableRefresh(text: string): boolean {
    if (!text || text.length < 1200) {
      return false;
    }

    const hasHousingContext =
      /annex\s*1|habitatges|viviendas|lloguer|adjudicaci[oó]/i.test(text);
    const hasTableSignals =
      /\bBX\b|\bplanta\b\s+\bporta\b|m[²2]\s*computables|lloguer\s+mensual|478,87|63,85/i.test(
        text,
      );

    return hasHousingContext && !hasTableSignals;
  }

  @Cron(process.env.CRON_PUBLISH_PROMOTIONS || CronExpression.EVERY_HOUR, {
    timeZone: process.env.JOB_TIMEZONE || 'Europe/Madrid',
  })
  async publishPendingPromotions() {
    await this.runWithLock('publish_pending_promotions', async () => {
      const pending = await this.prisma.promotion.findMany({
        where: { publishStatus: 'pending' },
        take: 50,
      });

      for (const promotion of pending) {
        await this.prisma.publishedPost.create({
          data: {
            sourceKind: 'promotion',
            sourceId: promotion.id,
            audience: promotion.isProOnly ? 'pro' : 'normal',
            channel: 'in_app',
            payloadJson: { title: promotion.title, id: promotion.id },
            status: 'sent',
            sentAt: new Date(),
          },
        });

        await this.prisma.promotion.update({
          where: { id: promotion.id },
          data: { publishStatus: 'published' },
        });
      }

      return { published: pending.length };
    });
  }

  @Cron(process.env.CRON_SEND_REMINDERS || CronExpression.EVERY_DAY_AT_8AM, {
    timeZone: process.env.JOB_TIMEZONE || 'Europe/Madrid',
  })
  async sendReminders() {
    await this.runWithLock('send_reminders', async () => {
      const due = await this.prisma.reminder.findMany({
        where: {
          sentAt: null,
          remindAt: { lte: new Date() },
        },
        take: 100,
      });

      for (const reminder of due) {
        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: { sentAt: new Date() },
        });
      }

      return { sent: due.length };
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

      const maxItems = Number(process.env.DAILY_NEWS_MAX_ITEMS ?? 5);
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

        const analyzed = await this.extractionService.analyzeNewsItem({
          title: item.title,
          content: item.content,
          source: item.sourceName,
          url: item.link,
          publishedAt: item.publishedAt.toISOString(),
        });

        await this.prisma.newsItem.create({
          data: {
            title: item.title,
            sourceName: item.sourceName,
            sourceUrl: item.sourceUrl,
            itemUrl: item.link,
            publishedAt: item.publishedAt,
            rawText: item.content,
            summary: analyzed.summary,
            relevance: analyzed.relevance,
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
