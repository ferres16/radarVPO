import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CourseAccessRuleType,
  CourseAccessType,
  CourseStatus,
  LessonProgressStatus,
  SubscriptionStatus,
} from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FileStorageService } from '../storage/file-storage.service';

type AccessDecision = {
  canAccess: boolean;
  reason:
    | 'free'
    | 'plan'
    | 'entitlement'
    | 'purchase'
    | 'subscription'
    | 'service'
    | 'manual'
    | 'locked';
};

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
  ) {}

  private readonly publicLessonSelect = {
    id: true,
    title: true,
    slug: true,
    summary: true,
    order: true,
    durationMinutes: true,
    status: true,
    type: true,
  } satisfies Prisma.CourseLessonSelect;

  async listCourses() {
    return this.prisma.course.findMany({
      where: { status: CourseStatus.published },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        modules: {
          where: { visibility: 'visible' },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          include: {
            lessons: {
              where: { status: 'published' },
              orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
              select: {
                id: true,
                title: true,
                slug: true,
                summary: true,
                order: true,
                durationMinutes: true,
                status: true,
                type: true,
              },
            },
          },
        },
      },
    });
  }

  async listCoursesForUser(userId: string) {
    const [courses, profile] = await Promise.all([
      this.prisma.course.findMany({
        where: { status: CourseStatus.published },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        include: {
          modules: {
            where: { visibility: 'visible' },
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
            include: {
              lessons: {
                where: { status: 'published' },
                orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  summary: true,
                  order: true,
                  durationMinutes: true,
                  status: true,
                  type: true,
                },
              },
            },
          },
          accessRules: { orderBy: { createdAt: 'asc' } },
        },
      }),
      this.getAccessProfile(userId),
    ]);

    return courses.map((course) => ({
      ...this.stripInternalCourseFields(course),
      access: this.evaluateAccess(course, profile),
    }));
  }

  private async getPublishedCourseBySlug(
    slug: string,
    includeAccessRules = false,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          where: { visibility: 'visible' },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          include: {
            lessons: {
              where: { status: 'published' },
              orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
              select: this.publicLessonSelect,
            },
          },
        },
        accessRules: includeAccessRules
          ? { orderBy: { createdAt: 'asc' } }
          : false,
      },
    });

    if (!course || course.status !== CourseStatus.published) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  private stripInternalCourseFields<T extends { accessRules?: unknown }>(
    course: T,
  ) {
    const publicCourse = { ...course };
    delete publicCourse.accessRules;
    return publicCourse;
  }

  async getCourseBySlug(slug: string) {
    const course = await this.getPublishedCourseBySlug(slug);
    return this.stripInternalCourseFields(course);
  }

  async getCourseBySlugForUser(slug: string, userId: string) {
    const [course, profile] = await Promise.all([
      this.getPublishedCourseBySlug(slug, true),
      this.getAccessProfile(userId),
    ]);

    return {
      ...this.stripInternalCourseFields(course),
      access: this.evaluateAccess(course, profile),
    };
  }

  async getLessonBySlug(
    courseSlug: string,
    lessonSlug: string,
    userId: string,
  ) {
    const course = await this.getPublishedCourseBySlug(courseSlug, true);
    const profile = await this.getAccessProfile(userId);
    const access = this.evaluateAccess(course, profile);

    const lesson = await this.prisma.courseLesson.findFirst({
      where: {
        courseId: course.id,
        slug: { in: this.normalizeLessonSlugs(lessonSlug) },
        status: 'published',
      },
      include: {
        module: true,
        blocks: {
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          include: {
            assets: {
              orderBy: { createdAt: 'asc' },
              include: { fileAsset: true },
            },
          },
        },
        assets: {
          orderBy: { createdAt: 'asc' },
          include: { fileAsset: true },
        },
        resources: {
          orderBy: { createdAt: 'asc' },
          include: { fileAsset: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (!access.canAccess) {
      return {
        course: this.stripInternalCourseFields(course),
        access,
        lesson: {
          ...lesson,
          contentJson: null,
          blocks: [],
          assets: [],
          resources: [],
        },
      };
    }

    await this.trackLessonProgress(
      userId,
      lesson.courseId,
      lesson.moduleId,
      lesson.id,
    );

    const resources = await Promise.all(
      lesson.resources.map(async (resource) => {
        const { fileAsset, ...publicResource } = resource;
        if (!resource.fileAssetId) {
          return publicResource;
        }

        const signed = await this.fileStorage.getAccessibleUrl(
          resource.fileAssetId,
          true,
        );

        return {
          ...publicResource,
          publicUrl: signed.url || publicResource.publicUrl,
        };
      }),
    );

    const lessonAssets = await Promise.all(
      lesson.assets.map((asset) => this.withAccessibleCourseAsset(asset)),
    );

    const blocks = await Promise.all(
      lesson.blocks.map(async (block) => ({
        ...block,
        assets: await Promise.all(
          block.assets.map((asset) => this.withAccessibleCourseAsset(asset)),
        ),
      })),
    );

    return {
      course: this.stripInternalCourseFields(course),
      access,
      lesson: {
        ...lesson,
        blocks,
        assets: lessonAssets,
        resources,
      },
    };
  }

  private async withAccessibleCourseAsset<
    T extends { fileAssetId: string | null; url: string | null; fileAsset?: unknown },
  >(asset: T) {
    const { fileAsset, ...publicAsset } = asset;
    if (!asset.fileAssetId) {
      return publicAsset;
    }

    const signed = await this.fileStorage.getAccessibleUrl(
      asset.fileAssetId,
      true,
    );

    return {
      ...publicAsset,
      url: signed.url || publicAsset.url,
    };
  }

  async markLessonCompletedBySlug(
    userId: string,
    courseSlug: string,
    lessonSlug: string,
  ) {
    const [course, profile] = await Promise.all([
      this.getPublishedCourseBySlug(courseSlug, true),
      this.getAccessProfile(userId),
    ]);
    const access = this.evaluateAccess(course, profile);

    if (!access.canAccess) {
      throw new ForbiddenException('Access denied');
    }

    const lesson = await this.prisma.courseLesson.findFirst({
      where: {
        courseId: course.id,
        slug: { in: this.normalizeLessonSlugs(lessonSlug) },
        status: 'published',
      },
      select: { id: true, courseId: true, moduleId: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
      update: {
        status: LessonProgressStatus.completed,
        completedAt: new Date(),
      },
      create: {
        userId,
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        lessonId: lesson.id,
        status: LessonProgressStatus.completed,
        completedAt: new Date(),
      },
    });

    return this.recalculateCourseProgress(userId, lesson.courseId, lesson.id);
  }

  async getCourseAssetUrl(assetId: string, userId: string) {
    const asset = await this.prisma.courseAsset.findUnique({
      where: { id: assetId },
      include: {
        course: {
          include: {
            accessRules: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });

    if (!asset || !asset.fileAssetId) {
      throw new NotFoundException('Course asset not found');
    }

    const profile = await this.getAccessProfile(userId);
    const access = this.evaluateAccess(asset.course, profile);

    if (!asset.isPublic && !access.canAccess) {
      throw new ForbiddenException('Access denied');
    }

    return this.fileStorage.getAccessibleUrl(asset.fileAssetId, access.canAccess);
  }

  async getCourseProgressBySlug(userId: string, courseSlug: string) {
    const [course, profile] = await Promise.all([
      this.getPublishedCourseBySlug(courseSlug, true),
      this.getAccessProfile(userId),
    ]);

    const access = this.evaluateAccess(course, profile);
    if (!access.canAccess) {
      return {
        courseId: course.id,
        progressPercent: 0,
        completedLessons: 0,
        totalLessons: await this.prisma.courseLesson.count({
          where: { courseId: course.id, status: 'published' },
        }),
        lastLessonId: null,
      };
    }

    return this.recalculateCourseProgress(userId, course.id);
  }

  private async recalculateCourseProgress(
    userId: string,
    courseId: string,
    lastLessonId?: string,
  ) {
    const [totalLessons, completedLessons] = await Promise.all([
      this.prisma.courseLesson.count({
        where: { courseId, status: 'published' },
      }),
      this.prisma.lessonProgress.count({
        where: { userId, courseId, status: LessonProgressStatus.completed },
      }),
    ]);

    const progressPercent =
      totalLessons === 0
        ? 0
        : Math.min(100, Math.round((completedLessons / totalLessons) * 100));

    return this.prisma.courseProgress.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {
        progressPercent,
        completedLessons,
        totalLessons,
        lastLessonId: lastLessonId ?? undefined,
      },
      create: {
        userId,
        courseId,
        progressPercent,
        completedLessons,
        totalLessons,
        lastLessonId,
      },
    });
  }

  private normalizeLessonSlugs(raw: string) {
    const normalized = this.slugify(raw);
    return normalized && normalized !== raw ? [raw, normalized] : [raw];
  }

  private slugify(input: string) {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  private async trackLessonProgress(
    userId: string,
    courseId: string,
    moduleId: string,
    lessonId: string,
  ) {
    const existing = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { status: true },
    });

    if (!existing) {
      await this.prisma.lessonProgress.create({
        data: {
          userId,
          courseId,
          moduleId,
          lessonId,
          status: LessonProgressStatus.in_progress,
        },
      });
    } else if (existing.status !== LessonProgressStatus.completed) {
      await this.prisma.lessonProgress.update({
        where: { userId_lessonId: { userId, lessonId } },
        data: { status: LessonProgressStatus.in_progress },
      });
    }

    await this.recalculateCourseProgress(userId, courseId, lessonId);
  }

  private async getAccessProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        plan: true,
        entitlements: true,
        purchases: { where: { status: 'paid' } },
        subscriptions: {
          where: {
            status: {
              in: [SubscriptionStatus.active, SubscriptionStatus.trialing],
            },
          },
        },
        courseAccesses: {
          where: { isActive: true },
          select: { courseId: true },
        },
        serviceAccesses: {
          where: { isActive: true },
          select: { service: { select: { id: true, key: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private evaluateAccess(
    course: {
      id?: string;
      accessType: CourseAccessType;
      pricingType?: string;
      accessRules?: Array<{
        ruleType: CourseAccessRuleType;
        configJson: Prisma.JsonValue;
      }>;
    },
    profile: {
      plan: string;
      entitlements: Array<{ key: string }>;
      purchases: Array<{ productKey: string; courseId: string | null }>;
      subscriptions: Array<{ planKey: string }>;
      courseAccesses: Array<{ courseId: string }>;
      serviceAccesses: Array<{ service: { id: string; key: string } }>;
    },
  ): AccessDecision {
    if (
      course.accessType === CourseAccessType.free &&
      course.pricingType !== 'premium'
    ) {
      return { canAccess: true, reason: 'free' };
    }

    if (
      course.id &&
      profile.courseAccesses.some((access) => access.courseId === course.id)
    ) {
      return { canAccess: true, reason: 'manual' };
    }

    const rules = course.accessRules ?? [];

    for (const rule of rules) {
      if (!rule.configJson || typeof rule.configJson !== 'object') {
        continue;
      }
      const config = rule.configJson as Record<string, unknown>;

      if (rule.ruleType === CourseAccessRuleType.plan) {
        const requiredPlan =
          typeof config.plan === 'string' ? config.plan : undefined;
        if (requiredPlan && profile.plan === requiredPlan) {
          return { canAccess: true, reason: 'plan' };
        }
      }

      if (rule.ruleType === CourseAccessRuleType.entitlement) {
        const key = typeof config.key === 'string' ? config.key : undefined;
        if (
          key &&
          profile.entitlements.some((entitlement) => entitlement.key === key)
        ) {
          return { canAccess: true, reason: 'entitlement' };
        }
      }

      if (rule.ruleType === CourseAccessRuleType.purchase) {
        const productKey =
          typeof config.productKey === 'string' ? config.productKey : undefined;
        const courseId =
          typeof config.courseId === 'string' ? config.courseId : undefined;
        const match = profile.purchases.some(
          (purchase) =>
            (productKey && purchase.productKey === productKey) ||
            (courseId && purchase.courseId === courseId),
        );
        if (match) {
          return { canAccess: true, reason: 'purchase' };
        }
      }

      if (rule.ruleType === CourseAccessRuleType.service) {
        const serviceKey =
          typeof config.serviceKey === 'string' ? config.serviceKey : undefined;
        const serviceId =
          typeof config.serviceId === 'string' ? config.serviceId : undefined;
        const match = profile.serviceAccesses.some(
          (access) =>
            (serviceKey && access.service.key === serviceKey) ||
            (serviceId && access.service.id === serviceId),
        );
        if (match) {
          return { canAccess: true, reason: 'service' };
        }
      }

      if (rule.ruleType === CourseAccessRuleType.subscription) {
        const planKey =
          typeof config.planKey === 'string' ? config.planKey : undefined;
        if (
          planKey &&
          profile.subscriptions.some(
            (subscription) => subscription.planKey === planKey,
          )
        ) {
          return { canAccess: true, reason: 'subscription' };
        }
      }
    }

    if (course.accessType === CourseAccessType.pro && profile.plan === 'pro') {
      return { canAccess: true, reason: 'plan' };
    }

    if (course.accessType === CourseAccessType.seguimiento) {
      const match = profile.serviceAccesses.some(
        (access) => access.service.key === 'seguimiento',
      );
      if (match) {
        return { canAccess: true, reason: 'service' };
      }
    }

    return { canAccess: false, reason: 'locked' };
  }
}
