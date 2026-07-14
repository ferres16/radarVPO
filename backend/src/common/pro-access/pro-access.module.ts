import { Global, Module } from '@nestjs/common';
import { ProAccessService } from './pro-access.service';

@Global()
@Module({
  providers: [ProAccessService],
  exports: [ProAccessService],
})
export class ProAccessModule {}
