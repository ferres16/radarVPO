import { ApiPropertyOptional } from '@nestjs/swagger';
import { CourseAccessRuleType } from '@prisma/client';
import { IsEnum, IsObject, IsOptional } from 'class-validator';

export class UpdateCourseAccessRuleDto {
  @ApiPropertyOptional({ enum: CourseAccessRuleType })
  @IsOptional()
  @IsEnum(CourseAccessRuleType)
  ruleType?: CourseAccessRuleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  configJson?: Record<string, unknown>;
}
