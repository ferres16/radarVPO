import { ApiProperty } from '@nestjs/swagger';
import { CourseAssetKind } from '@prisma/client';
import { IsBooleanString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadCourseBlockAssetDto {
  @ApiProperty({ enum: CourseAssetKind })
  @IsEnum(CourseAssetKind)
  kind!: CourseAssetKind;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBooleanString()
  isPublic?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  altText?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  caption?: string;
}
