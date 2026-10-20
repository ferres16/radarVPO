import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

class PromoRuleConfigDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  guideSlug?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(36)
  months?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  priceCents?: number;
}

export class UpdatePromoRuleDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PromoRuleConfigDto)
  config?: PromoRuleConfigDto;
}
