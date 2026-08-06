import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MinLength,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number = 3000;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  @IsOptional()
  @IsUrl()
  FRONTEND_URL?: string;

  @IsOptional()
  @IsString()
  COOKIE_DOMAIN?: string;

  @IsOptional()
  @IsString()
  COOKIE_SAMESITE?: string;

  @IsOptional()
  @IsBooleanString()
  COOKIE_SECURE?: string;

  @IsOptional()
  @IsString()
  TZ?: string;

  @IsOptional()
  @IsString()
  APP_ENV?: string;

  @IsOptional()
  @IsString()
  LOG_LEVEL?: string;

  @IsOptional()
  @IsString()
  DEFAULT_TIMEZONE?: string;

  @IsOptional()
  @IsString()
  JOB_TIMEZONE?: string;

  @IsOptional()
  @IsString()
  AWS_ACCESS_KEY_ID?: string;

  @IsOptional()
  @IsString()
  AWS_SECRET_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  AWS_REGION?: string;

  @IsOptional()
  @IsString()
  AWS_S3_BUCKET?: string;

  @IsOptional()
  @IsString()
  AWS_S3_PUBLIC_BASE_URL?: string;

  @IsOptional()
  @IsString()
  AWS_S3_ENDPOINT?: string;

  @IsOptional()
  @IsBooleanString()
  AWS_S3_FORCE_PATH_STYLE?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  MAX_FILE_SIZE_BYTES?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  PROMOTION_ASSET_MAX_SIZE_BYTES?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  COURSE_ASSET_MAX_SIZE_BYTES?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  COURSE_COVER_MAX_SIZE_BYTES?: number;

  @IsOptional()
  @IsInt()
  @Min(60)
  S3_SIGNED_URL_TTL_SECONDS?: number;

  @IsOptional()
  @IsString()
  ALLOWED_FILE_MIME_TYPES?: string;

  @IsOptional()
  @IsString()
  S3_ENDPOINT?: string;

  @IsOptional()
  @IsString()
  S3_REGION?: string;

  @IsOptional()
  @IsString()
  S3_ACCESS_KEY_ID?: string;

  @IsOptional()
  @IsString()
  S3_SECRET_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  S3_BUCKET?: string;

  @IsOptional()
  @IsString()
  S3_PUBLIC_BASE_URL?: string;

  @IsOptional()
  @IsBooleanString()
  S3_FORCE_PATH_STYLE?: string;

  @IsOptional()
  @IsBooleanString()
  NEWS_ENABLED?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  DAILY_NEWS_MAX_ITEMS?: number;

  @IsOptional()
  @IsString()
  NEWS_RSS_FEEDS?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  NEWS_RSS_LOOKBACK_DAYS?: number;

  @IsOptional()
  @IsString()
  OPENAI_API_KEY?: string;

  @IsOptional()
  @IsString()
  OPENAI_MODEL?: string;

  @IsOptional()
  @IsUrl()
  OPENAI_BASE_URL?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_BOT_TOKEN?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_CHANNEL_ID?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_CHANNEL_ID_PRO?: string;

  @IsOptional()
  @IsString()
  BREVO_API_KEY?: string;

  @IsOptional()
  @IsString()
  BREVO_SMS_SENDER?: string;

  @IsOptional()
  @IsString()
  BREVO_EMAIL_SENDER?: string;

  @IsOptional()
  @IsBooleanString()
  BREVO_PRO_ALERTS_ENABLED?: string;

  @IsOptional()
  @IsString()
  STRIPE_SECRET_KEY?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  STRIPE_PORTAL_RETURN_URL?: string;

  @IsOptional()
  @IsUrl()
  REGISTRE_NEWS_URL?: string;

  @IsOptional()
  @IsInt()
  @Min(2000)
  REGISTRE_MIN_YEAR?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(25)
  REGISTRE_MAX_PAGES?: number;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  const stringValue = (value: unknown, fallback = '') =>
    typeof value === 'string' ? value : fallback;
  const nodeEnv = stringValue(config.NODE_ENV, 'development');
  const insecurePlaceholders = new Set([
    'replace-with-long-secret',
    'replace-with-long-secret-2',
    'changeme',
    'secret',
  ]);
  const accessSecret = stringValue(config.JWT_ACCESS_SECRET);
  const refreshSecret = stringValue(config.JWT_REFRESH_SECRET);

  if (
    insecurePlaceholders.has(accessSecret) ||
    insecurePlaceholders.has(refreshSecret)
  ) {
    throw new Error('JWT secrets must not use example placeholders');
  }

  if (
    nodeEnv === 'production' &&
    (!config.CORS_ORIGIN || !config.FRONTEND_URL)
  ) {
    throw new Error('CORS_ORIGIN and FRONTEND_URL are required in production');
  }

  return validatedConfig;
}
