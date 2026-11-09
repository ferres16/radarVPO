import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';

export class PreviewProNotificationDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  promotionId!: string;

  @ApiProperty({
    enum: ['new_alert', 'new_publication', 'reminder_7d', 'reminder_1d'],
  })
  @IsIn(['new_alert', 'new_publication', 'reminder_7d', 'reminder_1d'])
  kind!: 'new_alert' | 'new_publication' | 'reminder_7d' | 'reminder_1d';
}
