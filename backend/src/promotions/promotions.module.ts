import { Module } from '@nestjs/common';
import { MetricsModule } from '../metrics/metrics.module';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule, MetricsModule],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
