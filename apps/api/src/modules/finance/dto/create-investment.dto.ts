import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum InvestmentType {
  STOCK = 'stock',
  CRYPTO = 'crypto',
  FUND = 'fund',
  REAL_ESTATE = 'real_estate',
  OTHER = 'other',
}

export class CreateInvestmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(InvestmentType)
  type: InvestmentType;

  @IsString()
  @IsOptional()
  ticker?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
