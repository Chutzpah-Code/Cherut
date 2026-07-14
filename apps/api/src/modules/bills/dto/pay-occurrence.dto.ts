import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Matches } from 'class-validator';

export class PayOccurrenceDto {
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'paidAt must be YYYY-MM-DD' })
  paidAt: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
