import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListPromotionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

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
    enum: ['published_unreviewed', 'published_reviewed', 'archived'],
  })
  @IsOptional()
  @IsIn(['published_unreviewed', 'published_reviewed', 'archived'])
  status?: 'published_unreviewed' | 'published_reviewed' | 'archived';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
