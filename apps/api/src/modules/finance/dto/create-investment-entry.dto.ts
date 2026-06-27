import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Matches } from 'class-validator';

export class CreateInvestmentEntryDto {
  @IsString()
  @IsNotEmpty()
  investmentId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
