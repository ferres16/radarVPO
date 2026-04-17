import { Module } from '@nestjs/common';
import { AiProviderService } from './ai.provider.service';
import { CircuitBreakerService } from './circuit-breaker.service';

@Module({
  providers: [AiProviderService, CircuitBreakerService],
  exports: [AiProviderService],
})
export class AiModule {}
