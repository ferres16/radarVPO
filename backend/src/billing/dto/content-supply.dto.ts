import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class ContentSupplyStartDto {
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9-]+$/i)
  courseSlug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  path?: string;
}
