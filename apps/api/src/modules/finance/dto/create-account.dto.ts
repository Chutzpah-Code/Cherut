import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT = 'credit',
  WALLET = 'wallet',
  OTHER = 'other',
}

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  balance?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
