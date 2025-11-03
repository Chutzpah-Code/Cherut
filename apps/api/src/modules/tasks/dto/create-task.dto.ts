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
} from 'class-validator';

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

  @IsNumber()
  @Min(0)
  @IsOptional()
  completedPomodoros?: number;

  // Link to Life Area
  @IsString()
  @IsOptional()
  lifeAreaId?: string;

  // Link to Action Plan (if task comes from 5W2H)
  @IsString()
  @IsOptional()
  actionPlanId?: string;

  // Tags for categorization
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  // Kanban board column order
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}
