import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AnalyzePdfUrlDto {
  @ApiProperty({
    description:
      'PDF URL to process. chrome-extension:// wrappers are normalized automatically.',
  })
  @IsString()
  @MaxLength(4000)
  pdfUrl!: string;

  @ApiPropertyOptional({
    description:
      'Optional source URL of the announcement/news entry associated with the PDF.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  sourceUrl?: string;
}
