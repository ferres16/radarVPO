import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    description: 'Opcional. Solo se usa para los avisos por SMS de PRO.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^(\+?[0-9][0-9\s-]{6,20})?$/, {
    message: 'El teléfono no tiene un formato válido.',
  })
  phone?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({
    description: 'Aceptación de la política de privacidad (obligatoria).',
  })
  @IsBoolean()
  @Equals(true, {
    message: 'Debes aceptar la política de privacidad para crear la cuenta.',
  })
  acceptedPrivacy!: boolean;
}
