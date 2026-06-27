import { IsString, IsNotEmpty, IsNumber, Min, Matches } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be YYYY-MM' })
  month: string;
}
