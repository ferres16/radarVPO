import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { resolvePublicSiteUrl } from '../common/public-site-url';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  createPasswordResetToken,
  getPasswordResetCooldownRemainingMs,
  hashPasswordResetToken,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from './password-reset.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(
      dto.email.toLowerCase(),
    );
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        phone: dto.phone,
        passwordHash,
        role: 'user',
        plan: 'free',
      },
    });

    return this.issueTokens(user.id, user.email, user.role, user.plan, true);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithHash(
      dto.email.toLowerCase(),
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email, user.role, user.plan, true);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; sessionId: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          select: { id: true, email: true, role: true, plan: true },
        },
      },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    const matches = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );
    if (!matches) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Session mismatch');
    }

    return this.issueTokens(
      session.user.id,
      session.user.email,
      session.user.role,
      session.user.plan,
      false,
      session.id,
    );
  }

  async logout(sessionId?: string) {
    if (!sessionId) {
      return;
    }

    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async requestPasswordReset(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const genericResponse = {
      success: true,
      message:
        'Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña.',
    };

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return genericResponse;
    }

    const recentRequest = await this.prisma.passwordResetToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (recentRequest) {
      const remainingMs = getPasswordResetCooldownRemainingMs(
        recentRequest.createdAt,
      );
      if (remainingMs > 0) {
        const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
        throw new BadRequestException(
          `Solo puedes solicitar un enlace de recuperación una vez cada 24 horas. Vuelve a intentarlo en ${remainingHours} h.`,
        );
      }
    }

    const { rawToken, tokenHash } = createPasswordResetToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = `${resolvePublicSiteUrl()}/reset-password?token=${rawToken}`;
    const sent = await this.notifications.sendPasswordResetEmail({
      email: user.email,
      fullName: user.fullName,
      resetUrl,
    });

    if (!sent) {
      throw new BadRequestException(
        'No se pudo enviar el correo de recuperación. Inténtalo más tarde.',
      );
    }

    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = hashPasswordResetToken(dto.token.trim());
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true },
        },
      },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new BadRequestException(
        'El enlace de recuperación no es válido o ha caducado.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const usedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt },
      }),
      this.prisma.session.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: usedAt },
      }),
    ]);

    return {
      success: true,
      message: 'Contraseña actualizada. Ya puedes iniciar sesión.',
    };
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: 'user' | 'admin',
    plan: 'free' | 'pro',
    updateLastLogin: boolean,
    existingSessionId?: string,
  ) {
    const sessionId = existingSessionId ?? crypto.randomUUID();

    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, role, plan, sessionId },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, sessionId },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.session.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        userId,
        refreshTokenHash,
        expiresAt,
      },
      update: {
        refreshTokenHash,
        expiresAt,
        revokedAt: null,
      },
    });

    if (updateLastLogin) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      });
    }

    return {
      accessToken,
      refreshToken,
      sessionId,
      user: { id: userId, email, role, plan },
    };
  }
}
