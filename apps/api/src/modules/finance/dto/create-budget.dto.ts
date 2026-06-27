import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  // YYYY-MM
  @IsString()
  @IsNotEmpty()
  month: string;
}
