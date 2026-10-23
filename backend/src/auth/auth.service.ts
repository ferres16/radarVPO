import {
  BadRequestException,
  Injectable,
  Logger,
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
import { VerifyEmailDto } from './dto/verify-email.dto';
import {
  createEmailVerificationToken,
  EMAIL_VERIFY_RESEND_COOLDOWN_MS,
  EMAIL_VERIFY_RESEND_MAX_PER_DAY,
  EMAIL_VERIFY_TOKEN_TTL_MS,
  hashEmailVerificationToken,
} from './email-verification.util';
import {
  createPasswordResetToken,
  getPasswordResetCooldownRemainingMs,
  hashPasswordResetToken,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from './password-reset.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
      throw new BadRequestException(
        'No se ha podido crear la cuenta con esos datos. Si ya tienes cuenta, inicia sesión.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const marketingOptIn = dto.acceptedMarketing === true;
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        // El móvil es opcional; no activa SMS por sí solo (smsAlertsEnabled=false).
        phone: dto.phone?.trim() ?? '',
        passwordHash,
        role: 'user',
        plan: 'free',
        emailVerifiedAt: null,
        marketingOptInAt: marketingOptIn ? new Date() : null,
        smsAlertsEnabled: false,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'auth.register.privacy_accepted',
        entity: 'User',
        entityId: user.id,
        metadata: {
          source: 'register',
          acceptedAt: new Date().toISOString(),
          marketingOptIn,
        },
      },
    });

    await this.sendVerificationEmail(user.id, user.email, user.fullName).catch(
      () => undefined,
    );

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
        return genericResponse;
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
      this.logger.warn(`Password reset email was not sent for user ${user.id}`);
    }

    return genericResponse;
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const tokenHash = hashEmailVerificationToken(dto.token.trim());
    const row = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: {
        user: { select: { id: true, email: true, emailVerifiedAt: true } },
      },
    });

    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new BadRequestException(
        'El enlace de verificación no es válido o ha caducado.',
      );
    }

    const usedAt = new Date();
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { emailVerifiedAt: usedAt },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: row.id },
        data: { usedAt },
      }),
      this.prisma.emailVerificationToken.updateMany({
        where: { userId: row.userId, usedAt: null, id: { not: row.id } },
        data: { usedAt },
      }),
    ]);

    return {
      success: true,
      message: 'Email verificado. Ya puedes comprar y activar avisos PRO.',
    };
  }

  async resendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerifiedAt: true,
      },
    });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }
    if (user.emailVerifiedAt) {
      return { success: true, message: 'Tu email ya está verificado.' };
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await this.prisma.emailVerificationToken.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: EMAIL_VERIFY_RESEND_MAX_PER_DAY,
      select: { createdAt: true },
    });
    if (recent.length >= EMAIL_VERIFY_RESEND_MAX_PER_DAY) {
      throw new BadRequestException(
        'Has alcanzado el límite de reenvíos. Prueba mañana o revisa tu bandeja de spam.',
      );
    }
    if (recent[0]) {
      const elapsed = Date.now() - recent[0].createdAt.getTime();
      if (elapsed < EMAIL_VERIFY_RESEND_COOLDOWN_MS) {
        throw new BadRequestException(
          'Espera un minuto antes de solicitar otro correo de verificación.',
        );
      }
    }

    await this.sendVerificationEmail(user.id, user.email, user.fullName);
    return {
      success: true,
      message: 'Te hemos enviado un nuevo enlace de verificación.',
    };
  }

  private async sendVerificationEmail(
    userId: string,
    email: string,
    fullName: string | null,
  ) {
    const { rawToken, tokenHash } = createEmailVerificationToken();
    const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TOKEN_TTL_MS);
    await this.prisma.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    });
    const verifyUrl = `${resolvePublicSiteUrl()}/verify-email?token=${rawToken}`;
    const displayName = fullName?.trim() || email;
    const sent = await this.notifications.sendTemplatedEmail({
      templateKey: 'auth.verify_email',
      toEmail: email,
      toName: displayName,
      vars: {
        name: displayName,
        email,
        url: verifyUrl,
        title: '',
        location: '',
        date: '',
        product: '',
        price: '',
        phone: '',
      },
      fallbackSubject: 'Confirma tu email en Radar VPO',
      fallbackHtml: `<p>Hola ${displayName},</p><p>Confirma tu dirección de correo para comprar y recibir avisos.</p><p><a href="${verifyUrl}">Verificar email</a></p>`,
    });
    if (!sent) {
      throw new BadRequestException(
        'No se pudo enviar el correo de verificación. Inténtalo más tarde.',
      );
    }
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
        expiresIn: '7d',
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
