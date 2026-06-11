import { ApiProperty } from '@nestjs/swagger';
import { LessonStatus, LessonType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCourseLessonDto {
  @ApiProperty()
  @IsString()
  @MaxLength(180)
  title!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase kebab-case',
  })
  @MaxLength(180)
  slug!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  summary?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  contentJson?: Record<string, unknown>;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiProperty({ enum: LessonStatus, default: LessonStatus.draft })
  @IsEnum(LessonStatus)
  status!: LessonStatus;

  @ApiProperty({ enum: LessonType, default: LessonType.text })
  @IsEnum(LessonType)
  type!: LessonType;
}
