import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class BackofficeDeliveryOpsDto {
  @ApiPropertyOptional({ description: 'Buscar por destino u origen' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ['all', 'sms', 'email'] })
  @IsOptional()
  @IsIn(['all', 'sms', 'email'])
  channel?: 'all' | 'sms' | 'email';

  @ApiPropertyOptional({ enum: ['all', 'sent', 'failed'] })
  @IsOptional()
  @IsIn(['all', 'sent', 'failed'])
  status?: 'all' | 'sent' | 'failed';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
