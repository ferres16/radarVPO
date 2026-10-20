import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { NewsModule } from '../news/news.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { JobsService } from './jobs.service';
import { RssNewsService } from './rss-news.service';
import { RegistreScraperService } from './registre-scraper.service';
import { NewsAutomationService } from './news-automation.service';

@Module({
  imports: [AiModule, NotificationsModule, NewsModule],
  providers: [
    JobsService,
    RssNewsService,
    RegistreScraperService,
    NewsAutomationService,
  ],
  exports: [RegistreScraperService, NewsAutomationService],
})
export class JobsModule {}
