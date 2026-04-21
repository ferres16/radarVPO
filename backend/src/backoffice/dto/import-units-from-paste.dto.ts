import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ImportUnitsFromPasteDto {
  @ApiProperty({ description: 'TSV or CSV pasted text including header row' })
  @IsString()
  text!: string;
}
