import { PartialType } from '@nestjs/mapped-types';
import { CreateKeyResultDto } from '../../key-results/dto/create-key-result.dto';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateKeyResultDto extends PartialType(CreateKeyResultDto) {
  @IsString()
  @IsOptional()
  completedAt?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
