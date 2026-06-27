import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, Min, Matches } from 'class-validator';

export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum RecurringType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateRecurringDto {
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(RecurringType)
  type: RecurringType;

  @IsEnum(RecurringFrequency)
  frequency: RecurringFrequency;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be YYYY-MM-DD' })
  startDate: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
