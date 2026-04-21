import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

const isProduction = process.env.NODE_ENV === 'production';

type RequestWithCookies = Request & {
  cookies?: {
    refresh_token?: string;
    session_id?: string;
  };
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.writeAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.sessionId,
    );
    return { user: result.user };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.writeAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.sessionId,
    );
    return { user: result.user };
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = dto.refreshToken ?? req.cookies?.refresh_token;
    if (!token) {
      throw new BadRequestException('Refresh token required');
    }
    const result = await this.authService.refresh(token);
    this.writeAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.sessionId,
    );
    return { user: result.user };
  }

  @Post('logout')
  async logout(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = req.cookies?.session_id;
    await this.authService.logout(sessionId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('session_id');
    return { success: true };
  }

  private writeAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    sessionId: string,
  ) {
    const cookieOptions = {
      httpOnly: true,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      secure: isProduction,
      path: '/',
    };

    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie('session_id', sessionId, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}
