import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

  // Internal: fetch user including passwordHash for auth checks only
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

  async updateProfile(id: string, fullName?: string | null) {
    return this.prisma.user.update({
      where: { id },
      data: { fullName: fullName ?? undefined },
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
