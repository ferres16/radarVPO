import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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
}
