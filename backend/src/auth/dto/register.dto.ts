import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
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
}
