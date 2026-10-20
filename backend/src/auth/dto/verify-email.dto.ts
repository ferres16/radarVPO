import { IsString, Length, Matches } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @Length(32, 128)
  @Matches(/^[a-f0-9]+$/i)
  token!: string;
}
