import { IsIn, IsNotEmpty } from 'class-validator';

export class EnrollDto {
  @IsIn([7, 14])
  @IsNotEmpty()
  pace: 7 | 14;
}
