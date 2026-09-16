import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, Matches } from 'class-validator';
import { AssetClass } from '../constants/asset-classes';

export { AssetClass };

export enum Liquidity {
  LIQUID = 'liquid',
  ILLIQUID = 'illiquid',
}

export class CreateInvestmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AssetClass)
  assetClass: AssetClass;

  // Validated against ASSET_CLASSES[assetClass].types in the service layer —
  // class-validator can't express a cross-field enum-of-enums check cleanly.
  @IsString()
  @IsNotEmpty()
  assetType: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  acquiredValue?: number;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'acquiredDate must be YYYY-MM-DD' })
  acquiredDate?: string;

  @IsNumber()
  currentValue: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'valuedDate must be YYYY-MM-DD' })
  valuedDate: string;

  @IsEnum(Liquidity)
  liquidity: Liquidity;

  @IsString()
  @IsOptional()
  linkedAccountId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  // Real estate
  @IsNumber()
  @IsOptional()
  area?: number;

  @IsString()
  @IsOptional()
  registration?: string;

  @IsString()
  @IsOptional()
  address?: string;

  // Vehicles & vessels, Equipment
  @IsNumber()
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  plateOrSerial?: string;

  @IsNumber()
  @IsOptional()
  depreciationPerYear?: number;

  @IsString()
  @IsOptional()
  referenceTable?: string;

  // Currency & commodities, Metals & collectibles
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsString()
  @IsOptional()
  priceSource?: string;

  // Business
  @IsString()
  @IsOptional()
  counterparty?: string;

  @IsString()
  @IsOptional()
  stake?: string;

  @IsString()
  @IsOptional()
  interestReturn?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endsOn must be YYYY-MM-DD' })
  endsOn?: string;

  @IsBoolean()
  @IsOptional()
  createIncomingBills?: boolean;

  // Digital
  @IsNumber()
  @IsOptional()
  monthlyRevenue?: number;

  @IsString()
  @IsOptional()
  renewsOrExpiresOn?: string;
}
