import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsInt, Min, Max, Matches } from 'class-validator';

export enum BillFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
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

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be YYYY-MM-DD' })
  startDate: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
