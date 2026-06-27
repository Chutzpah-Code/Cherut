import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CategoryType)
  type: CategoryType;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
