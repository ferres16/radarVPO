import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { RssNewsService } from './rss-news.service';
import { RegistreScraperService } from './registre-scraper.service';

@Module({
  providers: [
    JobsService,
    RssNewsService,
    RegistreScraperService,
  ],
  exports: [RegistreScraperService],
})
export class JobsModule {}
