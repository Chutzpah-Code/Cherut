import { IsString, IsNotEmpty, IsOptional, MaxLength, IsBoolean, IsIn, IsInt } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  // Minimum plan tier required to access this course — absent means
  // visible to any authenticated user (including no subscription).
  @IsIn(['core', 'method', 'mentorship'])
  @IsOptional()
  requiredPlan?: 'core' | 'method' | 'mentorship';

  @IsInt()
  @IsOptional()
  order?: number;
}
