import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CreateWaitlistLeadDto } from './dto/create-waitlist-lead.dto';
import { WaitlistService } from './waitlist.service';

type AuthedRequest = Request & { user?: { sub?: string } };

@ApiTags('waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 8, ttl: seconds(60) } })
  join(@Body() dto: CreateWaitlistLeadDto, @Req() req: AuthedRequest) {
    return this.waitlistService.join(dto, req.user?.sub);
  }
}
