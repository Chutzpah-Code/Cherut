import { PartialType } from '@nestjs/mapped-types';
import { CreateKeyResultDto } from './create-key-result.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateKeyResultDto extends PartialType(CreateKeyResultDto) {
  @IsString()
  @IsOptional()
  completedAt?: string;
}
