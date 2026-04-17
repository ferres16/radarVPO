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

  @ApiPropertyOptional({ enum: ['open', 'closed', 'upcoming', 'draft'] })
  @IsOptional()
  @IsEnum(['open', 'closed', 'upcoming', 'draft'])
  status?: 'open' | 'closed' | 'upcoming' | 'draft';

  @ApiPropertyOptional({
    description:
      'When true, return published announcements only (open/closed) that have at least one PDF document.',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @IsEnum(['true', 'false'])
  publishedOnly?: 'true' | 'false';
}
