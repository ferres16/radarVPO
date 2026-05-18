import { ApiProperty } from '@nestjs/swagger';
import { CourseAccessRuleType } from '@prisma/client';
import { IsEnum, IsObject } from 'class-validator';

export class CreateCourseAccessRuleDto {
  @ApiProperty({ enum: CourseAccessRuleType })
  @IsEnum(CourseAccessRuleType)
  ruleType!: CourseAccessRuleType;

  @ApiProperty()
  @IsObject()
  configJson!: Record<string, unknown>;
}
