import { PartialType } from '@nestjs/mapped-types';
import { CreateLifeAreaDto } from './create-life-area.dto';

export class UpdateLifeAreaDto extends PartialType(CreateLifeAreaDto) {}
