import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async listCourses() {
    return this.prisma.educationalTopic.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      include: {
        posts: {
          where: { publishedAt: { not: null } },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
  }

  async getCourseBySlug(slug: string) {
    const course = await this.prisma.educationalTopic.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { publishedAt: { not: null } },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!course || !course.active) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async getModuleBySlug(courseSlug: string, moduleSlug: string) {
    const course = await this.prisma.educationalTopic.findUnique({
      where: { slug: courseSlug },
      include: {
        posts: {
          where: { slug: moduleSlug, publishedAt: { not: null } },
          include: { assets: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    if (!course || !course.active || course.posts.length === 0) {
      throw new NotFoundException('Module not found');
    }

    return {
      course,
      module: course.posts[0],
    };
  }
}
