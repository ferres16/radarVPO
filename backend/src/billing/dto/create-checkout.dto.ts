import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCheckoutDto {
  @IsIn(['pro', 'pro_pack_3m', 'course'])
  product!: 'pro' | 'pro_pack_3m' | 'course';

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9-]+$/i)
  courseSlug?: string;

  /** Aceptación de las condiciones de contratación (obligatoria). */
  @IsBoolean()
  acceptedTerms!: boolean;

  /** Conformidad con el acceso inmediato (cursos y suscripción PRO). */
  @IsBoolean()
  acceptedImmediateAccess!: boolean;
}
