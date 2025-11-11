import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Checklist item for subtasks
 */
export class ChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  completed: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  timeTracked?: number; // seconds
}

/**
 * Time tracking entry
 */
export class TimeTrackingEntry {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number; // seconds

  @IsEnum(['running', 'paused', 'completed', 'cancelled'])
  status: 'running' | 'paused' | 'completed' | 'cancelled';
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  // Pomodoro estimation (number of 25-min sessions)
  @IsNumber()
  @Min(0)
  @Max(16)
  @IsOptional()
  estimatedPomodoros?: number;

  // Link to Life Area
  @IsString()
  @IsOptional()
  lifeAreaId?: string;

  // Link to Objective (OKR)
  @IsString()
  @IsOptional()
  objectiveId?: string;

  // Link to Key Result (OKR)
  @IsString()
  @IsOptional()
  keyResultId?: string;

  // Link to Action Plan (if task comes from 5W2H)
  @IsString()
  @IsOptional()
  actionPlanId?: string;

  // Tags for categorization
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  // Checklist for subtasks
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  @IsOptional()
  checklist?: ChecklistItemDto[];

  // Time tracking entries
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeTrackingEntry)
  @IsOptional()
  timeTracking?: TimeTrackingEntry[];

  // Total time tracked in seconds
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalTimeTracked?: number;

  // Archive status
  @IsBoolean()
  @IsOptional()
  archived?: boolean;

  // Kanban board column order
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}
