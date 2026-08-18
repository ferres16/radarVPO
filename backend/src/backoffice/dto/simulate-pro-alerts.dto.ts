import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export const PRO_ALERT_SIMULATION_KINDS = [
  'new_alert',
  'reminder_7d',
  'reminder_1d',
  'new_publication',
] as const;

export type ProAlertSimulationKind = (typeof PRO_ALERT_SIMULATION_KINDS)[number];

export class SimulateProAlertsDto {
  @ApiProperty()
  @IsString()
  promotionId!: string;

  @ApiPropertyOptional({
    enum: PRO_ALERT_SIMULATION_KINDS,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsIn(PRO_ALERT_SIMULATION_KINDS, { each: true })
  kinds?: ProAlertSimulationKind[];

  @ApiPropertyOptional({
    description:
      'If true (default), send only to the current admin. If false, send to all PRO users.',
  })
  @IsOptional()
  @IsBoolean()
  onlyMe?: boolean;
}
