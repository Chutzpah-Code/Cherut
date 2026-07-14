import { IsString, IsNumber, IsOptional, IsEnum, Min, Matches } from 'class-validator';

export enum OccurrenceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export class UpdateOccurrenceDto {
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dueDate must be YYYY-MM-DD' })
  dueDate?: string;

  @IsEnum(OccurrenceStatus)
  @IsOptional()
  status?: OccurrenceStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
