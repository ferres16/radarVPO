import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BackofficeService } from './backoffice.service';
import { ImportUnitsFromPasteDto } from './dto/import-units-from-paste.dto';
import { ReorderUnitsDto } from './dto/reorder-units.dto';
import { UpdatePromotionStatusDto } from './dto/update-promotion-status.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpsertUnitDto } from './dto/upsert-unit.dto';

@ApiTags('backoffice')
@Controller('backoffice')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Roles('admin')
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  @Get('overview')
  overview() {
    return this.backofficeService.overview();
  }

  @Get('jobs')
  jobs() {
    return this.backofficeService.jobs();
  }

  @Get('failures')
  failures() {
    return this.backofficeService.failures();
  }

  @Get('promotions')
  listPromotions(@Query('status') status?: string) {
    return this.backofficeService.listPromotions(status);
  }

  @Get('promotions/:id')
  getPromotion(@Param('id') promotionId: string) {
    return this.backofficeService.getPromotion(promotionId);
  }

  @Get('promotions/:id/preview')
  preview(@Param('id') promotionId: string) {
    return this.backofficeService.previewPromotion(promotionId);
  }

  @Patch('promotions/:id')
  updatePromotion(
    @Param('id') promotionId: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.backofficeService.updatePromotion(promotionId, dto);
  }

  @Patch('promotions/:id/status')
  updateStatus(
    @Param('id') promotionId: string,
    @Body() dto: UpdatePromotionStatusDto,
  ) {
    return this.backofficeService.updatePromotionStatus(promotionId, dto);
  }

  @Post('promotions/:id/units')
  createUnit(@Param('id') promotionId: string, @Body() dto: UpsertUnitDto) {
    return this.backofficeService.createUnit(promotionId, dto);
  }

  @Patch('promotions/:id/units/:unitId')
  updateUnit(
    @Param('id') promotionId: string,
    @Param('unitId') unitId: string,
    @Body() dto: UpsertUnitDto,
  ) {
    return this.backofficeService.updateUnit(promotionId, unitId, dto);
  }

  @Delete('promotions/:id/units/:unitId')
  deleteUnit(@Param('id') promotionId: string, @Param('unitId') unitId: string) {
    return this.backofficeService.deleteUnit(promotionId, unitId);
  }

  @Post('promotions/:id/units/:unitId/duplicate')
  duplicateUnit(
    @Param('id') promotionId: string,
    @Param('unitId') unitId: string,
  ) {
    return this.backofficeService.duplicateUnit(promotionId, unitId);
  }

  @Post('promotions/:id/units/reorder')
  reorderUnits(
    @Param('id') promotionId: string,
    @Body() dto: ReorderUnitsDto,
  ) {
    return this.backofficeService.reorderUnits(promotionId, dto.unitIds);
  }

  @Post('promotions/:id/units/import-paste')
  importUnitsFromPaste(
    @Param('id') promotionId: string,
    @Body() dto: ImportUnitsFromPasteDto,
  ) {
    return this.backofficeService.importUnitsFromPaste(promotionId, dto.text);
  }

  @Post('promotions/:id/documents/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Param('id') promotionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.backofficeService.uploadDocument(promotionId, dto, file);
  }
}
