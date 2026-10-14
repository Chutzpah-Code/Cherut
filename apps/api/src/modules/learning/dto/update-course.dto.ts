import { IsString, IsOptional, MaxLength, IsBoolean, IsIn, IsInt } from 'class-validator';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsIn(['core', 'method', 'mentorship'])
  @IsOptional()
  requiredPlan?: 'core' | 'method' | 'mentorship';

  @IsInt()
  @IsOptional()
  order?: number;
}
