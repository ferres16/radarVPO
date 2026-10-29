import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateWaitlistLeadDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: ['pro', 'guide', 'both'] })
  @IsIn(['pro', 'guide', 'both'])
  product!: 'pro' | 'guide' | 'both';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  municipality?: string;

  /** Consentimiento del aviso de lista de espera (obligatorio). */
  @ApiProperty()
  @IsBoolean()
  waitlistConsent!: boolean;

  /** Consentimiento separado para campañas futuras (opcional). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sourcePath?: string;
}
