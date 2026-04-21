import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class UpsertUnitDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  rowOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unitLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stair?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  door?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  bathrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  usefulAreaM2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  builtAreaM2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priceSale?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monthlyRent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  reservation?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  extraData?: Record<string, unknown>;
}
