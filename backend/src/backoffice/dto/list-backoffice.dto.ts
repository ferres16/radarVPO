import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class BackofficeListDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

export class BackofficeListPromotionsDto extends BackofficeListDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
