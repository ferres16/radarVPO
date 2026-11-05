import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { ListPromotionsDto } from './dto/list-promotions.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { PromotionsService } from './promotions.service';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async list(
    @Query() query: ListPromotionsDto,
    @CurrentUser() user?: CurrentUserPayload | null,
  ) {
    return this.promotionsService.list(query, user?.sub);
  }

  @Get('user/favorites')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  async favorites(@CurrentUser() user: CurrentUserPayload) {
    return this.promotionsService.listFavorites(user.sub);
  }

  @Get('stats')
  async stats() {
    return this.promotionsService.publicStats();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async byId(
    @Param('id') id: string,
    @CurrentUser() user?: CurrentUserPayload | null,
  ) {
    return this.promotionsService.getById(id, user?.sub);
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

  @Patch(':id/favorite')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  async updateFavorite(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateFavoriteDto,
  ) {
    return this.promotionsService.updateFavorite(user.sub, id, dto);
  }
}
