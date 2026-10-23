import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateInterestLeadDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsIn(['guide', 'pro', 'general'])
  product!: 'guide' | 'pro' | 'general';

  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  municipality?: string;

  @IsOptional()
  @IsIn(['buy', 'rent', 'both'])
  tenureInterest?: 'buy' | 'rent' | 'both';

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  searchPhase?: string;

  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  privacyVersion?: string;
}
