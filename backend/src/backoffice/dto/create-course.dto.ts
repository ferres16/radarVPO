import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { CourseAccessType, CoursePricingType, CourseStatus } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  @MaxLength(140)
  title!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase kebab-case',
  })
  @MaxLength(140)
  slug!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  longDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  coverImage?: string;

  @ApiProperty({ enum: CoursePricingType, default: CoursePricingType.free })
  @IsOptional()
  @IsEnum(CoursePricingType)
  pricingType?: CoursePricingType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2', force_decimal: false })
  price?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2', force_decimal: false })
  salePrice?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3,8}$/)
  @MaxLength(8)
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  stripePaymentLink?: string;

  @ApiProperty({ enum: CourseStatus, default: CourseStatus.draft })
  @IsEnum(CourseStatus)
  status!: CourseStatus;

  @ApiProperty({ enum: CourseAccessType, default: CourseAccessType.free })
  @IsEnum(CourseAccessType)
  accessType!: CourseAccessType;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  seoTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  seoMetadata?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  publishedAt?: string;
}
