import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
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
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  @IsOptional()
  @IsUrl()
  FRONTEND_URL?: string;

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
  OPENAI_API_KEY?: string;

  @IsOptional()
  @IsString()
  OPEN_API_KEY?: string;

  @IsOptional()
  @IsString()
  OPENAI_MODEL?: string;

  @IsOptional()
  @IsString()
  OPENAI_VISION_MODEL?: string;

  @IsOptional()
  @IsString()
  AZURE_OPENAI_API_KEY?: string;

  @IsOptional()
  @IsString()
  AZURE_OPENAI_ENDPOINT?: string;

  @IsOptional()
  @IsString()
  AZURE_OPENAI_DEPLOYMENT?: string;

  @IsOptional()
  @IsString()
  AZURE_OPENAI_API_VERSION?: string;

  @IsOptional()
  @IsString()
  ANTHROPIC_API_KEY?: string;

  @IsOptional()
  @IsString()
  ANTHROPIC_MODEL?: string;

  @IsOptional()
  @IsString()
  AI_PROVIDER_ORDER?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  AI_MAX_RETRIES?: number;

  @IsOptional()
  @IsInt()
  @Min(1000)
  AI_TIMEOUT_MS?: number;

  @IsOptional()
  @IsString()
  OCRSPACE_API_KEY?: string;

  @IsOptional()
  @IsString()
  OCRSPACE_LANGUAGE?: string;

  @IsOptional()
  @IsBooleanString()
  NEWS_ENABLED?: string;

  @IsOptional()
  @IsBooleanString()
  EDUCATIONAL_ENABLED?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  DAILY_NEWS_MAX_ITEMS?: number;

  @IsOptional()
  @IsString()
  NEWS_RSS_FEEDS?: string;

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
  @IsUrl()
  REGISTRE_NEWS_URL?: string;

  @IsOptional()
  @IsString()
  CRON_REPAIR_DOCUMENT_LINKS?: string;

  @IsOptional()
  @IsString()
  CRON_REANALYZE_STALE_PDFS?: string;

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

  return validatedConfig;
}
