import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateLessonProgressNotesDto {
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  exerciseAnswer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  notes?: string;
}
