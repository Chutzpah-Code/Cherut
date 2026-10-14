import { IsString, IsOptional, MaxLength, IsDateString, IsBoolean, IsIn, IsInt, Min, Max } from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  // ─── Visualization practice ("Visualizar e agir") ─────────────────────────

  @IsString()
  @IsOptional()
  objectiveId?: string;

  @IsIn([5, 10, 15])
  @IsOptional()
  plannedPracticeDurationMinutes?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  currentEmotion?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  currentEnergy?: number;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  currentConfidence?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  desiredState?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  empoweringBelief?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  outcomeVisualizationText?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  processVisualizationText?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  likelyObstacle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  obstacleResponse?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  nextAction?: string;

  @IsDateString()
  @IsOptional()
  nextActionDueDate?: string;
}
