import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProAccessService } from '../common/pro-access/pro-access.service';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly proAccess: ProAccessService,
    private readonly coursesService: CoursesService,
  ) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        plan: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async findByEmailWithHash(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        plan: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        plan: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getProfileWithProAccess(id: string) {
    const [user, proAccess] = await Promise.all([
      this.findById(id),
      this.proAccess.resolveForUser(id),
    ]);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      plan: user.plan,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      proAccess,
    };
  }

  async updateProfileWithProAccess(
    id: string,
    data: { fullName?: string | null; phone?: string | null },
  ) {
    const updated = await this.updateProfile(id, data);
    const proAccess = await this.proAccess.resolveForUser(id);

    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      phone: updated.phone,
      role: updated.role,
      plan: updated.plan,
      createdAt: updated.createdAt.toISOString(),
      lastLoginAt: updated.lastLoginAt?.toISOString() ?? null,
      proAccess,
    };
  }

  async updateProfile(
    id: string,
    data: { fullName?: string | null; phone?: string | null },
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName ?? undefined,
        phone: data.phone ?? undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        plan: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async getMyCourses(id: string) {
    return this.coursesService.listAccessibleCoursesWithProgress(id);
  }

  async getAccessSummary(userId: string) {
    const [services, courses] = await Promise.all([
      this.prisma.userServiceAccess.findMany({
        where: { userId, isActive: true },
        select: {
          activatedAt: true,
          service: { select: { id: true, key: true, name: true } },
        },
      }),
      this.prisma.userCourseAccess.findMany({
        where: { userId, isActive: true },
        select: {
          activatedAt: true,
          course: { select: { id: true, slug: true, title: true } },
        },
      }),
    ]);

    return {
      services,
      courses,
    };
  }
}
