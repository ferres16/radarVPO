import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdatePromotionStatusDto {
  @ApiProperty({ enum: ['pending_review', 'published_unreviewed', 'published_reviewed', 'archived'] })
  @IsIn(['pending_review', 'published_unreviewed', 'published_reviewed', 'archived'])
  status!: 'pending_review' | 'published_unreviewed' | 'published_reviewed' | 'archived';
}
