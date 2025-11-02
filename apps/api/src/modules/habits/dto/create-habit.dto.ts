import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum HabitType {
  BOOLEAN = 'boolean', // Yes/No (ex: meditated today?)
  COUNTER = 'counter', // Number (ex: glasses of water)
  DURATION = 'duration', // Time in minutes
}

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(HabitType)
  @IsNotEmpty()
  type: HabitType;

  @IsEnum(HabitFrequency)
  @IsNotEmpty()
  frequency: HabitFrequency;

  // Target value (for counter/duration types)
  @IsNumber()
  @Min(0)
  @IsOptional()
  targetValue?: number;

  // Unit (ex: "glasses", "minutes", "pages")
  @IsString()
  @IsOptional()
  unit?: string;

  // Days of week for weekly habits (0=Sunday, 6=Saturday)
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  weekDays?: number[];

  // Reminder time (HH:MM format)
  @IsString()
  @IsOptional()
  reminderTime?: string;

  @IsString()
  @IsOptional()
  lifeAreaId?: string;
}
