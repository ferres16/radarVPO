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
import { RolesGuard } from '../common/guards/roles.guard';
import { BackofficeService } from './backoffice.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';
import { CreateNewsItemDto } from './dto/create-news-item.dto';
import { ImportUnitsFromPasteDto } from './dto/import-units-from-paste.dto';
import { ReorderUnitsDto } from './dto/reorder-units.dto';
import { UpdateBackofficeNewsItemDto } from './dto/update-backoffice-news-item.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseModuleDto } from './dto/update-course-module.dto';
import { UpdatePromotionStatusDto } from './dto/update-promotion-status.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadCourseAssetDto } from './dto/upload-course-asset.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpsertUnitDto } from './dto/upsert-unit.dto';

@ApiTags('backoffice')
@Controller('backoffice')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Get('users')
  listUsers() {
    return this.backofficeService.listUsers();
  }

  @Patch('users/:id')
  updateUser(@Param('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.backofficeService.updateUser(userId, dto);
  }

  @Get('news')
  listNews() {
    return this.backofficeService.listNews();
  }

  @Get('courses')
  listCourses() {
    return this.backofficeService.listCourses();
  }

  @Post('courses')
  createCourse(@Body() dto: CreateCourseDto) {
    return this.backofficeService.createCourse(dto);
  }

  @Patch('courses/:id')
  updateCourse(@Param('id') courseId: string, @Body() dto: UpdateCourseDto) {
    return this.backofficeService.updateCourse(courseId, dto);
  }

  @Delete('courses/:id')
  deleteCourse(@Param('id') courseId: string) {
    return this.backofficeService.deleteCourse(courseId);
  }

  @Post('courses/:id/modules')
  createCourseModule(
    @Param('id') courseId: string,
    @Body() dto: CreateCourseModuleDto,
  ) {
    return this.backofficeService.createCourseModule(courseId, dto);
  }

  @Patch('courses/modules/:moduleId')
  updateCourseModule(
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateCourseModuleDto,
  ) {
    return this.backofficeService.updateCourseModule(moduleId, dto);
  }

  @Delete('courses/modules/:moduleId')
  deleteCourseModule(@Param('moduleId') moduleId: string) {
    return this.backofficeService.deleteCourseModule(moduleId);
  }

  @Post('courses/modules/:moduleId/assets/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadCourseAsset(
    @Param('moduleId') moduleId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadCourseAssetDto,
  ) {
    return this.backofficeService.uploadCourseAsset(moduleId, dto, file);
  }

  @Post('news')
  createNews(@Body() dto: CreateNewsItemDto) {
    return this.backofficeService.createNews(dto);
  }

  @Patch('news/:id')
  updateNews(@Param('id') newsId: string, @Body() dto: UpdateBackofficeNewsItemDto) {
    return this.backofficeService.updateNews(newsId, dto);
  }

  @Delete('news/:id')
  deleteNews(@Param('id') newsId: string) {
    return this.backofficeService.deleteNews(newsId);
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

  @Delete('promotions/:id/units')
  deleteAllUnits(@Param('id') promotionId: string) {
    return this.backofficeService.deleteAllUnits(promotionId);
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
