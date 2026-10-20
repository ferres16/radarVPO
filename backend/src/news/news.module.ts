import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';
import { NewsController } from './news.controller';
import { NewsCoverService } from './news-cover.service';
import { NewsService } from './news.service';

@Module({
  imports: [AiModule, StorageModule],
  providers: [NewsService, NewsCoverService],
  controllers: [NewsController],
  exports: [NewsService, NewsCoverService],
})
export class NewsModule {}
