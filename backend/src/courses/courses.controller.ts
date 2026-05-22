import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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

  @Get(':slug')
  getCourse(@Param('slug') slug: string) {
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
    return this.coursesService.markLessonCompletedBySlug(user.sub, slug, lessonSlug);
  }
}
