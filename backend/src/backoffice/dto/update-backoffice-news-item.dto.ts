import { IsDateString, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateBackofficeNewsItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  sourceName?: string;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  rawText?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  practicalImpact?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  relevance?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
