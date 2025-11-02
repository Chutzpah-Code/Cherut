import {
  IsDateString,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export enum TimeRange {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export class TrackingQueryDto {
  @IsEnum(TimeRange)
  @IsOptional()
  timeRange?: TimeRange;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  lifeAreaId?: string;

  @IsString()
  @IsOptional()
  objectiveId?: string;
}
