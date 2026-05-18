import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { CourseAccessType, CourseStatus } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  @MaxLength(140)
  title!: string;

  @ApiProperty()
  @IsString()
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
  @IsString()
  coverImage?: string;

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
}
