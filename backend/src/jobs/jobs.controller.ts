import {
  Controller,
  Headers,
  HttpCode,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { NewsCoverService } from '../news/news-cover.service';
import { NewsAutomationService } from './news-automation.service';

/**
 * Endpoints operativos protegidos por JOBS_ADMIN_TOKEN.
 * Útiles para forzar noticias/portadas sin SSH a Railway.
 */
@ApiExcludeController()
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly newsAutomation: NewsAutomationService,
    private readonly newsCover: NewsCoverService,
  ) {}

  private assertToken(token?: string) {
    const expected = process.env.JOBS_ADMIN_TOKEN?.trim();
    if (!expected || !token || token !== expected) {
      throw new UnauthorizedException('Invalid job token');
    }
  }

  @Post('generate-daily-news')
  @HttpCode(200)
  async generateDailyNews(
    @Headers('x-jobs-token') token: string | undefined,
    @Query('force') force?: string,
  ) {
    this.assertToken(token);
    const generation = await this.newsAutomation.generateDailyCatalunyaNews({
      force: force !== 'false',
    });
    const covers = await this.newsCover.backfillMissingCovers(30);
    return { generation, covers };
  }

  @Post('backfill-news-covers')
  @HttpCode(200)
  async backfillNewsCovers(
    @Headers('x-jobs-token') token: string | undefined,
    @Query('limit') limit?: string,
  ) {
    this.assertToken(token);
    const parsed = Number(limit);
    return this.newsCover.backfillMissingCovers(
      Number.isFinite(parsed) ? parsed : 30,
    );
  }
}
