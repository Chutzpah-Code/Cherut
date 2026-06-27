import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class PayStatementDto {
  @IsString()
  @IsNotEmpty()
  fromAccountId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
