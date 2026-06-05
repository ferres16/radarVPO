import { ApiPropertyOptional } from '@nestjs/swagger';
import { CourseModuleVisibility } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateCourseModuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ enum: CourseModuleVisibility })
  @IsOptional()
  @IsEnum(CourseModuleVisibility)
  visibility?: CourseModuleVisibility;
}
