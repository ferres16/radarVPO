import { Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post('visit')
  @HttpCode(204)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async visit() {
    await this.metricsService.recordUniqueVisit();
  }
}
