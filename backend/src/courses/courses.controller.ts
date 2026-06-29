import { Controller, Get, Param, Post, Redirect, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { CoursesService } from './courses.service';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  listCourses() {
    return this.coursesService.listCourses();
  }

  @UseGuards(JwtAuthGuard)
  @Get('access')
  listCoursesForUser(@CurrentUser() user: CurrentUserPayload) {
    return this.coursesService.listCoursesForUser(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('file-assets/:fileAssetId/media')
  @Redirect()
  async getFileAssetMedia(
    @Param('fileAssetId') fileAssetId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const url = await this.coursesService.getFileAssetMediaRedirectUrl(
      fileAssetId,
      user,
    );
    return { url, statusCode: 302 };
  }

  @UseGuards(JwtAuthGuard)
  @Get('assets/:assetId/url')
  getCourseAssetUrl(
    @Param('assetId') assetId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.getCourseAssetUrl(assetId, user.sub);
  }

  @Get(':slug/cover')
  @Redirect()
  async getCourseCover(@Param('slug') slug: string) {
    const url = await this.coursesService.getCourseCoverRedirectUrl(slug);
    return { url, statusCode: 302 };
  }

  @Get(':slug')
  getCourse(
    @Param('slug') slug: string,
  ) {
    return this.coursesService.getCourseBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':slug/access')
  getCourseForUser(
    @Param('slug') slug: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.getCourseBySlugForUser(slug, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':slug/lessons/:lessonSlug')
  getLesson(
    @Param('slug') slug: string,
    @Param('lessonSlug') lessonSlug: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.getLessonBySlug(slug, lessonSlug, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':slug/progress')
  getCourseProgress(
    @Param('slug') slug: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.getCourseProgressBySlug(user.sub, slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug/lessons/:lessonSlug/progress')
  markLessonCompleted(
    @Param('slug') slug: string,
    @Param('lessonSlug') lessonSlug: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.markLessonCompletedBySlug(
      user.sub,
      slug,
      lessonSlug,
    );
  }
}
