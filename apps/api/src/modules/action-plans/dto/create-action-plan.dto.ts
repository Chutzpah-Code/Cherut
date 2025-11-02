import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';

export enum ActionPlanStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export class CreateActionPlanDto {
  @IsString()
  @IsNotEmpty()
  keyResultId: string;

  // 5W2H Method Fields

  // WHAT - O que será feito?
  @IsString()
  @IsNotEmpty()
  what: string;

  // WHY - Por que será feito?
  @IsString()
  @IsNotEmpty()
  why: string;

  // WHERE - Onde será feito?
  @IsString()
  @IsNotEmpty()
  where: string;

  // WHEN - Quando será feito?
  @IsDateString()
  @IsNotEmpty()
  when: string;

  // WHO - Por quem será feito?
  @IsString()
  @IsNotEmpty()
  who: string;

  // HOW - Como será feito?
  @IsString()
  @IsNotEmpty()
  how: string;

  // HOW MUCH - Quanto custará?
  @IsString()
  @IsOptional()
  howMuch?: string;

  @IsEnum(ActionPlanStatus)
  @IsOptional()
  status?: ActionPlanStatus;
}
