import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class UpdateVisionBoardItemDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  fullDescription?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsOptional()
  order?: number;
}
