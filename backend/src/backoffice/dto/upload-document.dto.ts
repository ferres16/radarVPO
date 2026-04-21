import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ enum: ['pdf_original', 'screenshot', 'image', 'support_document'] })
  @IsEnum(['pdf_original', 'screenshot', 'image', 'support_document'])
  documentKind!: 'pdf_original' | 'screenshot' | 'image' | 'support_document';
}
