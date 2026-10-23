import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateCommerceSettingsDto {
  @IsOptional()
  @IsIn(['validation', 'live', 'maintenance'])
  salesMode?: 'validation' | 'live' | 'maintenance';

  @IsOptional()
  @IsBoolean()
  proEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  coursesEnabled?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  maintenanceMessage?: string;

  /** Precio previsto de la guía en céntimos; null limpia el valor. */
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  guideListPriceCents?: number | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  proPackGuideSlug?: string;

  @IsOptional()
  @IsBoolean()
  allowPromotionCodes?: boolean;

  @IsOptional()
  @IsBoolean()
  stripeAutomaticTax?: boolean;
}
