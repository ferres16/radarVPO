import { FavoriteStage } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { FAVORITE_CHECKLIST_IDS } from '../favorite-checklist';

export class UpdateFavoriteDto {
  @IsOptional()
  @IsEnum(FavoriteStage)
  stage?: FavoriteStage;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(FAVORITE_CHECKLIST_IDS.length)
  @IsIn([...FAVORITE_CHECKLIST_IDS], { each: true })
  checklistDone?: string[];
}
