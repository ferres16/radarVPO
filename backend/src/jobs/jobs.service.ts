import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegistreScraperService } from './registre-scraper.service';
import { NewsAutomationService } from './news-automation.service';
import { NotificationsService } from '../notifications/notifications.service';

const inMemoryLocks = new Set<string>();

@Injectable()
export class JobsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registreScraperService: RegistreScraperService,
    private readonly newsAutomationService: NewsAutomationService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onApplicationBootstrap() {
    // Always remove amendment publications from public catalogs on boot.
    await this.registreScraperService.archiveExistingAmendments().catch((error) => {
      this.logger.warn(
        `Amendment archive on boot failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    });

    // Avoid scrape + Brevo work on every deploy/restart unless explicitly enabled.
    if (process.env.RUN_JOBS_ON_BOOTSTRAP !== 'true') {
      this.logger.log(
        'Bootstrap jobs skipped (set RUN_JOBS_ON_BOOTSTRAP=true to scrape/news on boot).',
      );
      return;
    }

    await this.runPromotionsCheck({ notify: false });

    if ((process.env.NEWS_ENABLED ?? 'true') === 'true') {
      await this.runDailyHousingNews();
    }
  }

  private cronsEnabled() {
    return (process.env.ENABLE_CRONS ?? 'true') === 'true';
  }

  @Cron(process.env.CRON_CHECK_PROMOTIONS || CronExpression.EVERY_5_MINUTES, {
    timeZone: process.env.JOB_TIMEZONE || 'Europe/Madrid',
  })
  async checkPromotions() {
    if (!this.cronsEnabled()) return;
    await this.runPromotionsCheck({ notify: true });
  }

  @Cron(process.env.CRON_FETCH_DAILY_NEWS || CronExpression.EVERY_DAY_AT_6AM, {
    timeZone: process.env.JOB_TIMEZONE || 'Europe/Madrid',
  })
  async generateDailyHousingNews() {
    if (!this.cronsEnabled()) return;
    await this.runDailyHousingNews();
  }

  private async runPromotionsCheck(options: { notify: boolean }) {
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
            skippedAmendments: 0,
            createdAlertIds: [] as string[],
          };
        });

      this.logger.log(
        `Checked active sources=${count}; registre scanned=${registre.scanned}, created=${registre.promotionsCreated}, docs=${registre.documentsCreated}, merged=${registre.duplicatesMerged}, skippedAmendments=${registre.skippedAmendments}`,
      );

      const proAlertResults = [];
      if (options.notify && registre.createdAlertIds.length > 0) {
        for (const alertId of registre.createdAlertIds) {
          proAlertResults.push(
            await this.notificationsService.notifyProUsersForPromotion(alertId),
          );
        }
      } else if (options.notify) {
        this.logger.log('Pro alerts skipped: no newly created alerts in this run');
      }

      return {
        checkedSources: count,
        registre,
        proAlerts: {
          notified: proAlertResults.filter((item) => !item.skipped).length,
          sent: proAlertResults.reduce((acc, item) => acc + item.sent, 0),
          results: proAlertResults,
        },
      };
    });
  }

  private async runDailyHousingNews() {
    await this.runWithLock('generate_daily_housing_news', async () => {
      const enabled = (process.env.NEWS_ENABLED ?? 'true') === 'true';
      if (!enabled) {
        return { inserted: 0, reason: 'disabled' };
      }

      return this.newsAutomationService.generateDailyCatalunyaNews();
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
                message: error.message.slice(0, 500),
              }
            : { message: 'unknown' },
      },
    });
  }
}
