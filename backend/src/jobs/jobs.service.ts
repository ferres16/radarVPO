import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegistreScraperService } from './registre-scraper.service';
import { NewsAutomationService } from './news-automation.service';

const inMemoryLocks = new Set<string>();

@Injectable()
export class JobsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registreScraperService: RegistreScraperService,
    private readonly newsAutomationService: NewsAutomationService,
  ) {}

  async onApplicationBootstrap() {
    await this.checkPromotions();

    if ((process.env.NEWS_ENABLED ?? 'true') === 'true') {
      await this.generateDailyHousingNews();
    }
  }

  @Cron(process.env.CRON_CHECK_PROMOTIONS || CronExpression.EVERY_5_MINUTES, {
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
  async generateDailyHousingNews() {
    await this.runWithLock('generate_daily_housing_news', async () => {
      const enabled = (process.env.NEWS_ENABLED ?? 'true') === 'true';
      if (!enabled) {
        return { inserted: 0, reason: 'disabled' };
      }

      return this.newsAutomationService.generateDailyCatalunyaNews();
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

      const title = `Guia: ${topic.title}`;
      const slugBase = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const slug = `${slugBase}-${Date.now()}`;

      await this.prisma.educationalPost.create({
        data: {
          topicId: topic.id,
          title,
          slug,
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
