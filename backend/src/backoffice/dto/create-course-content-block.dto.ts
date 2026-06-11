import { ApiProperty } from '@nestjs/swagger';
import { CourseContentBlockType } from '@prisma/client';
import { IsEnum, IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class CreateCourseContentBlockDto {
  @ApiProperty({ enum: CourseContentBlockType })
  @IsEnum(CourseContentBlockType)
  type!: CourseContentBlockType;

  @ApiProperty()
  @IsObject()
  content!: Record<string, unknown>;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
