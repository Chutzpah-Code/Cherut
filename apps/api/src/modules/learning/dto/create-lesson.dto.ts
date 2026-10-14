import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  content?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  videoUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  exerciseText?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  templateText?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
