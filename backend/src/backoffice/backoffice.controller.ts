import {
  BadRequestException,
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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { BackofficeService } from './backoffice.service';
import { CreateCourseAccessRuleDto } from './dto/create-course-access-rule.dto';
import { CreateCourseContentBlockDto } from './dto/create-course-content-block.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateCourseLessonDto } from './dto/create-course-lesson.dto';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';
import { CreateNewsItemDto } from './dto/create-news-item.dto';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { ImportUnitsFromPasteDto } from './dto/import-units-from-paste.dto';
import {
  BackofficeListDto,
  BackofficeListFilesDto,
  BackofficeListPromotionsDto,
} from './dto/list-backoffice.dto';
import { ReorderCourseItemsDto } from './dto/reorder-course-items.dto';
import { ReorderUnitsDto } from './dto/reorder-units.dto';
import { UpdateAccessDto } from './dto/update-access.dto';
import { UpdateBackofficeNewsItemDto } from './dto/update-backoffice-news-item.dto';
import { UpdateCourseAccessRuleDto } from './dto/update-course-access-rule.dto';
import { UpdateCourseContentBlockDto } from './dto/update-course-content-block.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseLessonDto } from './dto/update-course-lesson.dto';
import { UpdateCourseModuleDto } from './dto/update-course-module.dto';
import { UpdatePromotionStatusDto } from './dto/update-promotion-status.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { UpdatePromotionDocumentDto } from './dto/update-promotion-document.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadCourseBlockAssetDto } from './dto/upload-course-block-asset.dto';
import { UploadCourseAssetDto } from './dto/upload-course-asset.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpsertUnitDto } from './dto/upsert-unit.dto';
import {
  ALLOWED_COURSE_ASSET_MIME_TYPES,
  ALLOWED_COURSE_COVER_MIME_TYPES,
  COURSE_ASSET_MAX_SIZE_BYTES,
  COURSE_COVER_MAX_SIZE_BYTES,
} from '../storage/upload-limits';

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

const createMimeFilter =
  (allowed: string[]) =>
  (
    req: unknown,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file?.mimetype || !allowed.includes(file.mimetype)) {
      return cb(new BadRequestException('Unsupported file type'), false);
    }
    return cb(null, true);
  };

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
  jobs(@Query() query: BackofficeListDto) {
    return this.backofficeService.jobs(query);
  }

  @Get('failures')
  failures(@Query() query: BackofficeListDto) {
    return this.backofficeService.failures(query);
  }

  @Get('files')
  listFiles(@Query() query: BackofficeListFilesDto) {
    return this.backofficeService.listFiles(query);
  }

  @Get('files/entity/:entityType/:entityId')
  listFilesForEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.backofficeService.listFilesForEntity(entityType, entityId);
  }

  @Post('files/:id/retry-delete')
  retryFileDeletion(@Param('id') fileAssetId: string) {
    return this.backofficeService.retryFileDeletion(fileAssetId);
  }

  @Get('users')
  listUsers(@Query() query: BackofficeListDto) {
    return this.backofficeService.listUsers(query);
  }

  @Patch('users/:id')
  updateUser(@Param('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.backofficeService.updateUser(userId, dto);
  }

  @Get('news')
  listNews(@Query() query: BackofficeListDto) {
    return this.backofficeService.listNews(query);
  }

  @Get('courses')
  listCourses(@Query() query: BackofficeListDto) {
    return this.backofficeService.listCourses(query);
  }

  @Get('services')
  listServices(@Query() query: BackofficeListDto) {
    return this.backofficeService.listServices(query);
  }

  @Post('services')
  createService(@Body() dto: CreateServiceDto) {
    return this.backofficeService.createService(dto);
  }

  @Patch('services/:id')
  updateService(@Param('id') serviceId: string, @Body() dto: UpdateServiceDto) {
    return this.backofficeService.updateService(serviceId, dto);
  }

  @Delete('services/:id')
  deleteService(@Param('id') serviceId: string) {
    return this.backofficeService.deleteService(serviceId);
  }

  @Get('access/users')
  listAccessUsers(@Query() query: BackofficeListDto) {
    return this.backofficeService.listAccessUsers(query);
  }

  @Get('access/users/:id')
  getAccessUser(@Param('id') userId: string) {
    return this.backofficeService.getAccessUser(userId);
  }

  @Patch('access/users/:id/courses/:courseId')
  updateCourseAccess(
    @Param('id') userId: string,
    @Param('courseId') courseId: string,
    @Body() dto: UpdateAccessDto,
    @CurrentUser() admin: CurrentUserPayload,
  ) {
    return this.backofficeService.upsertCourseAccess(
      userId,
      courseId,
      dto,
      admin.sub,
    );
  }

  @Patch('access/users/:id/services/:serviceId')
  updateServiceAccess(
    @Param('id') userId: string,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateAccessDto,
    @CurrentUser() admin: CurrentUserPayload,
  ) {
    return this.backofficeService.upsertServiceAccess(
      userId,
      serviceId,
      dto,
      admin.sub,
    );
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

  @Post('courses/:id/cover/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: COURSE_COVER_MAX_SIZE_BYTES },
      fileFilter: createMimeFilter(ALLOWED_COURSE_COVER_MIME_TYPES),
    }),
  )
  uploadCourseCover(
    @Param('id') courseId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() admin: CurrentUserPayload,
  ) {
    return this.backofficeService.uploadCourseCover(courseId, file, admin.sub);
  }

  @Post('courses/:id/modules')
  createCourseModule(
    @Param('id') courseId: string,
    @Body() dto: CreateCourseModuleDto,
  ) {
    return this.backofficeService.createCourseModule(courseId, dto);
  }

  @Post('courses/:id/modules/reorder')
  reorderCourseModules(
    @Param('id') courseId: string,
    @Body() dto: ReorderCourseItemsDto,
  ) {
    return this.backofficeService.reorderCourseModules(courseId, dto.ids);
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

  @Post('courses/modules/:moduleId/lessons')
  createCourseLesson(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateCourseLessonDto,
  ) {
    return this.backofficeService.createCourseLesson(moduleId, dto);
  }

  @Post('courses/modules/:moduleId/lessons/reorder')
  reorderCourseLessons(
    @Param('moduleId') moduleId: string,
    @Body() dto: ReorderCourseItemsDto,
  ) {
    return this.backofficeService.reorderCourseLessons(moduleId, dto.ids);
  }

  @Patch('courses/lessons/:lessonId')
  updateCourseLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateCourseLessonDto,
  ) {
    return this.backofficeService.updateCourseLesson(lessonId, dto);
  }

  @Delete('courses/lessons/:lessonId')
  deleteCourseLesson(@Param('lessonId') lessonId: string) {
    return this.backofficeService.deleteCourseLesson(lessonId);
  }

  @Post('courses/lessons/:lessonId/blocks')
  createCourseContentBlock(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateCourseContentBlockDto,
  ) {
    return this.backofficeService.createCourseContentBlock(lessonId, dto);
  }

  @Post('courses/lessons/:lessonId/blocks/reorder')
  reorderCourseContentBlocks(
    @Param('lessonId') lessonId: string,
    @Body() dto: ReorderCourseItemsDto,
  ) {
    return this.backofficeService.reorderCourseContentBlocks(lessonId, dto.ids);
  }

  @Patch('courses/blocks/:blockId')
  updateCourseContentBlock(
    @Param('blockId') blockId: string,
    @Body() dto: UpdateCourseContentBlockDto,
  ) {
    return this.backofficeService.updateCourseContentBlock(blockId, dto);
  }

  @Delete('courses/blocks/:blockId')
  deleteCourseContentBlock(@Param('blockId') blockId: string) {
    return this.backofficeService.deleteCourseContentBlock(blockId);
  }

  @Post('courses/blocks/:blockId/assets/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: COURSE_ASSET_MAX_SIZE_BYTES },
      fileFilter: createMimeFilter(ALLOWED_COURSE_ASSET_MIME_TYPES),
    }),
  )
  uploadCourseBlockAsset(
    @Param('blockId') blockId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadCourseBlockAssetDto,
    @CurrentUser() admin: CurrentUserPayload,
  ) {
    return this.backofficeService.uploadCourseBlockAsset(blockId, dto, file, admin.sub);
  }

  @Post('courses/lessons/:lessonId/resources/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: COURSE_ASSET_MAX_SIZE_BYTES },
      fileFilter: createMimeFilter(ALLOWED_COURSE_ASSET_MIME_TYPES),
    }),
  )
  uploadCourseResource(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadCourseAssetDto,
    @CurrentUser() admin: CurrentUserPayload,
  ) {
    return this.backofficeService.uploadCourseResource(lessonId, dto, file, admin.sub);
  }

  @Delete('courses/resources/:resourceId')
  deleteCourseResource(@Param('resourceId') resourceId: string) {
    return this.backofficeService.deleteCourseResource(resourceId);
  }

  @Delete('courses/assets/:assetId')
  deleteCourseAsset(@Param('assetId') assetId: string) {
    return this.backofficeService.deleteCourseAsset(assetId);
  }

  @Post('courses/:id/access-rules')
  createCourseAccessRule(
    @Param('id') courseId: string,
    @Body() dto: CreateCourseAccessRuleDto,
  ) {
    return this.backofficeService.createCourseAccessRule(courseId, dto);
  }

  @Patch('courses/access-rules/:ruleId')
  updateCourseAccessRule(
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateCourseAccessRuleDto,
  ) {
    return this.backofficeService.updateCourseAccessRule(ruleId, dto);
  }

  @Delete('courses/access-rules/:ruleId')
  deleteCourseAccessRule(@Param('ruleId') ruleId: string) {
    return this.backofficeService.deleteCourseAccessRule(ruleId);
  }

  @Post('news')
  createNews(@Body() dto: CreateNewsItemDto) {
    return this.backofficeService.createNews(dto);
  }

  @Patch('news/:id')
  updateNews(
    @Param('id') newsId: string,
    @Body() dto: UpdateBackofficeNewsItemDto,
  ) {
    return this.backofficeService.updateNews(newsId, dto);
  }

  @Delete('news/:id')
  deleteNews(@Param('id') newsId: string) {
    return this.backofficeService.deleteNews(newsId);
  }

  @Get('promotions')
  listPromotions(@Query() query: BackofficeListPromotionsDto) {
    return this.backofficeService.listPromotions(query);
  }

  @Post('promotions')
  createPromotion(@Body() dto: CreatePromotionDto) {
    return this.backofficeService.createPromotion(dto);
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

  @Delete('promotions/:id')
  deletePromotion(@Param('id') promotionId: string) {
    return this.backofficeService.deletePromotion(promotionId);
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
  deleteUnit(
    @Param('id') promotionId: string,
    @Param('unitId') unitId: string,
  ) {
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
  reorderUnits(@Param('id') promotionId: string, @Body() dto: ReorderUnitsDto) {
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
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_DOCUMENT_SIZE },
      fileFilter: createMimeFilter(ALLOWED_DOCUMENT_MIME_TYPES),
    }),
  )
  uploadDocument(
    @Param('id') promotionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() admin: CurrentUserPayload,
  ) {
    return this.backofficeService.uploadDocument(promotionId, dto, file, admin.sub);
  }

  @Delete('promotions/:id/documents/:documentId')
  deleteDocument(
    @Param('id') promotionId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.backofficeService.deletePromotionDocument(
      promotionId,
      documentId,
    );
  }

  @Patch('promotions/:id/documents/:documentId')
  updateDocument(
    @Param('id') promotionId: string,
    @Param('documentId') documentId: string,
    @Body() dto: UpdatePromotionDocumentDto,
  ) {
    return this.backofficeService.updatePromotionDocument(
      promotionId,
      documentId,
      dto,
    );
  }
}
