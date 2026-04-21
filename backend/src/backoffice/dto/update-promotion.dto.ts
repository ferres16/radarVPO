import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdatePromotionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(220)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

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
  @IsString()
  promotionType?: 'venta' | 'alquiler' | 'mixto' | 'desconocido';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promoter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  totalHomes?: number;

  @ApiPropertyOptional({ description: 'JSON string with dates block' })
  @IsOptional()
  @IsString()
  importantDatesJson?: string;

  @ApiPropertyOptional({ description: 'JSON string with requirements block' })
  @IsOptional()
  @IsString()
  requirementsJson?: string;

  @ApiPropertyOptional({ description: 'JSON string with economic block' })
  @IsOptional()
  @IsString()
  economicInfoJson?: string;

  @ApiPropertyOptional({ description: 'JSON string with fees/reservations block' })
  @IsOptional()
  @IsString()
  feesAndReservationsJson?: string;

  @ApiPropertyOptional({ description: 'JSON string with contact block' })
  @IsOptional()
  @IsString()
  contactInfoJson?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publicDescription?: string;

  @ApiPropertyOptional({ description: 'Texto plano con el bloque completo de viviendas disponibles' })
  @IsOptional()
  @IsString()
  availableUnitsText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statusMessage?: string;
}
