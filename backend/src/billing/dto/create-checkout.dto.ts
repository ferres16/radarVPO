import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCheckoutDto {
  @IsIn(['pro', 'course'])
  product!: 'pro' | 'course';

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9-]+$/i)
  courseSlug?: string;

  /** Aceptación de las condiciones de contratación (obligatoria). */
  @IsBoolean()
  acceptedTerms!: boolean;

  /** Solo cursos: conformidad con el acceso inmediato al contenido digital. */
  @IsOptional()
  @IsBoolean()
  acceptedImmediateAccess?: boolean;
}
