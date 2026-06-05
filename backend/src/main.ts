import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter());
  const isProduction = process.env.NODE_ENV === 'production';
  const configuredOrigins = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    isProduction ? undefined : 'http://localhost:3001',
  ]
    .flatMap((value) => (value ? value.split(',') : []))
    .map((value) => value.trim())
    .filter(Boolean);

  const corsOrigins = [...new Set(configuredOrigins)];

  const allowedOriginSet = new Set(corsOrigins);
  const isSafeMethod = (method?: string) =>
    !method || ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
  const resolveOrigin = (value?: string) => {
    if (!value) return undefined;
    try {
      return new URL(value).origin;
    } catch {
      return undefined;
    }
  };

  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (isSafeMethod(req.method) || allowedOriginSet.size === 0) {
      return next();
    }

    const cookieHeader = req.headers.cookie || '';
    const hasAuthCookie =
      cookieHeader.includes('access_token=') ||
      cookieHeader.includes('refresh_token=') ||
      cookieHeader.includes('session_id=');

    if (!hasAuthCookie) {
      return next();
    }

    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const normalizedOrigin = resolveOrigin(origin) || resolveOrigin(referer);

    if (!normalizedOrigin || !allowedOriginSet.has(normalizedOrigin)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Invalid request origin' },
      });
    }

    return next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Radar VPO API')
      .setDescription('API para deteccion de promociones VPO/HPO')
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .build();
    const doc = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, doc);
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
