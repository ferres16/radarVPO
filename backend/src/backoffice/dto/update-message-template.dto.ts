import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateMessageTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsOptional()
  @IsIn(['email', 'sms', 'both'])
  channel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  emailSubject?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  emailBody?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(480)
  smsBody?: string | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
