import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateKeyResultDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  objectiveId?: string;

  // Target value to achieve
  @IsNumber()
  @Min(0)
  targetValue: number;

  // Current progress value
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentValue?: number;

  // Unit of measurement (e.g., "users", "revenue", "%", "hours")
  @IsString()
  @IsNotEmpty()
  unit: string;

  // Order/position in the list (optional, will be set automatically if not provided)
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}
