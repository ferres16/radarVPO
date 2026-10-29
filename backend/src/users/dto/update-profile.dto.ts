import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(140)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^(\+?[0-9][0-9\s-]{6,20})?$/, {
    message: 'El teléfono no tiene un formato válido.',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Activar SMS de avisos PRO (requiere teléfono).',
  })
  @IsOptional()
  @IsBoolean()
  smsAlertsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Opt-in a comunicaciones comerciales (LSSI).',
  })
  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean;

  @ApiPropertyOptional({
    description: 'Ids canónicos de municipio para filtrar avisos PRO.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  alertMunicipalityIds?: string[];

  @ApiPropertyOptional({
    description: 'Regímenes de interés para avisos PRO.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsIn(['venta', 'alquiler', 'mixto'], { each: true })
  alertPromotionTypes?: Array<'venta' | 'alquiler' | 'mixto'>;
}
