import { IsString, IsOptional, MaxLength, IsInt } from 'class-validator';

export class UpdateCourseModuleDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
