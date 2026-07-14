import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getProfileWithProAccess(user.sub);
  }

  @Patch('me')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfileWithProAccess(user.sub, {
      fullName: dto.fullName ?? null,
      phone: dto.phone ?? null,
    });
  }

  @Get('me/courses')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  myCourses(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getMyCourses(user.sub);
  }

  @Get('access')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  access(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getAccessSummary(user.sub);
  }
}
