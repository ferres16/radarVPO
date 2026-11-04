import {
  IsBoolean,
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

  /** Precio mensual PRO en céntimos. null = usar env/default. */
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(100)
  @Max(50000)
  proPriceCents?: number | null;
}
