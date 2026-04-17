import { Controller, Get } from '@nestjs/common';

@Controller('healthz')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'radar-vpo-backend',
      time: new Date().toISOString(),
    };
  }
}
