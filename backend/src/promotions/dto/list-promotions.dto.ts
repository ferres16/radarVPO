import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

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
  @IsEnum(['venta', 'alquiler', 'mixto', 'desconocido'])
  promotionType?: 'venta' | 'alquiler' | 'mixto' | 'desconocido';

  @ApiPropertyOptional({ enum: ['detected', 'pending_review', 'published', 'archived'] })
  @IsOptional()
  @IsEnum(['detected', 'pending_review', 'published', 'archived'])
  status?: 'detected' | 'pending_review' | 'published' | 'archived';
}
