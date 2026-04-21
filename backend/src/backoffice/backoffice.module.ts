import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { BackofficeController } from './backoffice.controller';
import { BackofficeService } from './backoffice.service';

@Module({
  imports: [StorageModule],
  controllers: [BackofficeController],
  providers: [BackofficeService],
})
export class BackofficeModule {}
