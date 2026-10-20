import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { CoursesModule } from '../courses/courses.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [CoursesModule, BillingModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
