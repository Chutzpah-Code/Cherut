import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateColumnDto {
  @IsString()
  @IsOptional()
  name?: string;

  // A sort key, not an index — see the note in CreateColumnDto.
  @IsNumber()
  @IsOptional()
  order?: number;
}
