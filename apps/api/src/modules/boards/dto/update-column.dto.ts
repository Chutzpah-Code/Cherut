import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateColumnDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}
