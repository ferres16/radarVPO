import { Module } from '@nestjs/common';
import { CommerceModule } from '../commerce/commerce.module';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [CommerceModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
