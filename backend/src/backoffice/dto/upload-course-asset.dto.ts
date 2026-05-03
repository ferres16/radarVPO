import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UploadCourseAssetDto {
  @ApiProperty({ enum: ['image', 'video', 'file'] })
  @IsEnum(['image', 'video', 'file'])
  kind!: 'image' | 'video' | 'file';
}
