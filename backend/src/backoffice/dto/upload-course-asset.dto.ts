import { ApiProperty } from '@nestjs/swagger';
import { CourseResourceKind } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UploadCourseAssetDto {
  @ApiProperty({ enum: CourseResourceKind })
  @IsEnum(CourseResourceKind)
  kind!: CourseResourceKind;
}
