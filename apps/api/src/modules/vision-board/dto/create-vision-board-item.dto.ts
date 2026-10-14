import { IsString, IsNotEmpty, IsOptional, MaxLength, IsDateString, IsBoolean, IsIn, IsInt, Min, Max } from 'class-validator';

export class CreateVisionBoardItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000) // Descrição longa que só aparece no modal
  fullDescription?: string;

  // URL da imagem no Firebase Storage (não o arquivo!)
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  // Due date opcional (YYYY-MM-DD format)
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  // Ordem para drag-and-drop
  @IsOptional()
  order?: number;

  // Status ativo/arquivado (defaults to true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  // ─── Visualization practice ("Visualizar e agir") ─────────────────────────
  // Modeled after the state/outcome/process/action structure from "Unlimited
  // Power" (Tony Robbins) — state is composed of emotion+energy+confidence,
  // not a single feeling; the result is visualized separately from the
  // process/steps; a limiting belief gets a counter (empowering) belief; an
  // obstacle gets a planned response, not just a label.

  // Links to an existing Objective — same pattern as Task.objectiveId
  @IsString()
  @IsOptional()
  objectiveId?: string;

  @IsIn([5, 10, 15])
  @IsOptional()
  plannedPracticeDurationMinutes?: number;

  // Current state
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

  // Belief
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  empoweringBelief?: string;

  // Visualization — outcome vs. process
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  outcomeVisualizationText?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  processVisualizationText?: string;

  // Obstacle + planned response
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  likelyObstacle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  obstacleResponse?: string;

  // Action
  @IsString()
  @IsOptional()
  @MaxLength(500)
  nextAction?: string;

  @IsDateString()
  @IsOptional()
  nextActionDueDate?: string;
}
