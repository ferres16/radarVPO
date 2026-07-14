import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('create-portal-session')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  createPortalSession(@CurrentUser() user: CurrentUserPayload) {
    return this.billingService.createPortalSession(user.sub);
  }

  @Post('request-cancellation')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  requestCancellation(@CurrentUser() user: CurrentUserPayload) {
    return this.billingService.requestCancellation(user.sub);
  }
}
