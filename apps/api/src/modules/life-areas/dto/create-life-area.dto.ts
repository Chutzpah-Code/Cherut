import { IsString, IsNotEmpty, IsOptional, IsHexColor } from 'class-validator';

export class CreateLifeAreaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;
}
