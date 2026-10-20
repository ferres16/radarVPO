import { Module } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { MessageTemplatesService } from './message-templates.service';
import { PromoRulesService } from './promo-rules.service';

@Module({
  providers: [CommerceService, MessageTemplatesService, PromoRulesService],
  exports: [CommerceService, MessageTemplatesService, PromoRulesService],
})
export class CommerceModule {}
