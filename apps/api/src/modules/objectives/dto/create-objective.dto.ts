import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateKeyResultInlineDto } from './create-key-result-inline.dto';

export enum ObjectiveStatus {
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  BEHIND = 'behind',
  COMPLETED = 'completed',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
}

export class CreateObjectiveDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  lifeAreaId: string;

  @IsEnum(ObjectiveStatus)
  @IsOptional()
  status?: ObjectiveStatus;

  // Cycle in months (default: 3)
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  cycleMonths?: number;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKeyResultInlineDto)
  @IsOptional()
  keyResults?: CreateKeyResultInlineDto[];

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
