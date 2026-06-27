import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateInvestmentEntryDto {
  @IsString()
  @IsNotEmpty()
  investmentId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
