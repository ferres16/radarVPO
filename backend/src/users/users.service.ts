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
      select: { id: true, email: true, passwordHash: true, role: true, plan: true },
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
}
