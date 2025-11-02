import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export enum ObjectiveStatus {
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  BEHIND = 'behind',
  COMPLETED = 'completed',
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
}
