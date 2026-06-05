import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListPromotionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  municipality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ enum: ['venta', 'alquiler', 'mixto', 'desconocido'] })
  @IsOptional()
  @IsIn(['venta', 'alquiler', 'mixto', 'desconocido'])
  promotionType?: 'venta' | 'alquiler' | 'mixto' | 'desconocido';

  @ApiPropertyOptional({
    enum: [
      'pending_review',
      'published_unreviewed',
      'published_reviewed',
      'archived',
    ],
  })
  @IsOptional()
  @IsIn([
    'pending_review',
    'published_unreviewed',
    'published_reviewed',
    'archived',
  ])
  status?:
    | 'pending_review'
    | 'published_unreviewed'
    | 'published_reviewed'
    | 'archived';

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
