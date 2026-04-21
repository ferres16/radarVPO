import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdatePromotionStatusDto {
  @ApiProperty({ enum: ['detected', 'pending_review', 'published', 'archived'] })
  @IsEnum(['detected', 'pending_review', 'published', 'archived'])
  status!: 'detected' | 'pending_review' | 'published' | 'archived';
}
