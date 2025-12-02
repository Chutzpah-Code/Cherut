import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateValueDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  behaviors?: string;
}