import { ApiPropertyOptional } from '@nestjs/swagger';
import { CourseContentBlockType } from '@prisma/client';
import { IsEnum, IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class UpdateCourseContentBlockDto {
  @ApiPropertyOptional({ enum: CourseContentBlockType })
  @IsOptional()
  @IsEnum(CourseContentBlockType)
  type?: CourseContentBlockType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
