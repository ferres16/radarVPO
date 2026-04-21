import { IsDateString, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateNewsItemDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  @MaxLength(140)
  sourceName!: string;

  @IsUrl()
  sourceUrl!: string;

  @IsOptional()
  @IsUrl()
  itemUrl?: string;

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

  @IsString()
  @MaxLength(32)
  relevance!: string;

  @IsDateString()
  publishedAt!: string;
}
