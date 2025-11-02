import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';

export class LogHabitDto {
  @IsString()
  @IsNotEmpty()
  habitId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // YYYY-MM-DD format

  // For boolean habits
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  // For counter/duration habits
  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
