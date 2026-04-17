import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class AttachDocumentDto {
  @ApiProperty()
  @IsUrl()
  documentUrl!: string;

  @ApiProperty({ example: 'pdf' })
  @IsString()
  fileType!: string;
}
