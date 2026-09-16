import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsInt, Min, Max, Matches } from 'class-validator';

export enum BillFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  BIMONTHLY = 'bimonthly',
  QUARTERLY = 'quarterly',
  SEMIANNUAL = 'semiannual',
  ANNUAL = 'annual',
  CUSTOM = 'custom',
}

export enum BillType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateBillDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(BillType)
  type: BillType;

  @IsEnum(BillFrequency)
  frequency: BillFrequency;

  @IsInt()
  @Min(1)
  @Max(28)
  dueDay: number;

  // Only used when frequency === 'custom' — the rule repeats every N days.
  @IsInt()
  @Min(1)
  @IsOptional()
  interval?: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be YYYY-MM-DD' })
  startDate: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be YYYY-MM-DD' })
  endDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
