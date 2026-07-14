import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [CoursesModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
