import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

/**
 * DTO for creating Key Results inline during Objective creation
 * This DTO doesn't require objectiveId since it will be set automatically
 */
export class CreateKeyResultInlineDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

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
}