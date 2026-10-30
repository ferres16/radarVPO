import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { minutes, seconds, SkipThrottle, Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';
import { ContentSupplyStartDto } from './dto/content-supply.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /** Público: indica si el pago integrado está operativo (Stripe + webhook + toggles admin). */
  @Get('checkout-status')
  checkoutStatus() {
    return this.billingService.getCheckoutStatus();
  }

  @Post('checkout')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  createCheckout(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.billingService.createCheckoutSession(user.sub, dto);
  }

  /** Resultado de Checkout Session para /gracias (validado en servidor). */
  @Get('checkout-result')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: seconds(60) } })
  checkoutResult(
    @CurrentUser() user: CurrentUserPayload,
    @Query('session_id') sessionId?: string,
  ) {
    return this.billingService.getCheckoutResult(user.sub, sessionId || '');
  }

  /** Apertura efectiva de guía/curso (inicio de suministro digital). */
  @Post('content-supply-start')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 60, ttl: seconds(60) } })
  contentSupplyStart(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ContentSupplyStartDto,
  ) {
    return this.billingService.recordContentSupplyStart(user.sub, dto);
  }

  /** Webhook de Stripe. Verifica la firma sobre el cuerpo sin procesar. */
  @Post('webhook')
  @HttpCode(200)
  @SkipThrottle()
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    return this.billingService.handleWebhook(req.rawBody, signature);
  }

  @Post('create-portal-session')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  createPortalSession(@CurrentUser() user: CurrentUserPayload) {
    return this.billingService.createPortalSession(user.sub);
  }

  @Post('request-cancellation')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: minutes(60) } })
  requestCancellation(@CurrentUser() user: CurrentUserPayload) {
    return this.billingService.requestCancellation(user.sub);
  }

  @Post('withdraw-cancellation')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  withdrawCancellation(@CurrentUser() user: CurrentUserPayload) {
    return this.billingService.withdrawCancellation(user.sub);
  }
}
