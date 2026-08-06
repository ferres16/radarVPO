import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('healthz')
export class HealthController {
  @Get()
  @SkipThrottle()
  health() {
    return {
      status: 'ok',
      service: 'radar-vpo-backend',
      time: new Date().toISOString(),
    };
  }
}
