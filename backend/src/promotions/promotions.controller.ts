import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { ListPromotionsDto } from './dto/list-promotions.dto';
import { PromotionsService } from './promotions.service';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  async list(@Query() query: ListPromotionsDto) {
    return this.promotionsService.list(query);
  }

  @Get('user/favorites')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  async favorites(@CurrentUser() user: CurrentUserPayload) {
    return this.promotionsService.listFavorites(user.sub);
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    return this.promotionsService.getById(id);
  }

  @Post(':id/favorite')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.promotionsService.toggleFavorite(user.sub, id);
  }

}
