import { ApiProperty } from '@nestjs/swagger';
import { CourseModuleVisibility } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCourseModuleDto {
  @ApiProperty()
  @IsString()
  @MaxLength(160)
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiProperty({ enum: CourseModuleVisibility, default: CourseModuleVisibility.visible })
  @IsEnum(CourseModuleVisibility)
  visibility!: CourseModuleVisibility;
}
