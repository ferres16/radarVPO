import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { JobsService } from './jobs.service';
import { PdfOcrService } from './pdf-ocr.service';
import { StructuredExtractionService } from './structured-extraction.service';
import { RssNewsService } from './rss-news.service';
import { RegistreScraperService } from './registre-scraper.service';

@Module({
  imports: [AiModule],
  providers: [
    JobsService,
    PdfOcrService,
    StructuredExtractionService,
    RssNewsService,
    RegistreScraperService,
  ],
})
export class JobsModule {}
