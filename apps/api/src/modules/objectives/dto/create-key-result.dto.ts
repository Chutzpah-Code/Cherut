import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateKeyResultDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  dueDate: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
