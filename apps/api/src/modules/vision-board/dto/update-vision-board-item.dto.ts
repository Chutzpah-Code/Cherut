import { PartialType } from '@nestjs/mapped-types';
import { CreateVisionBoardItemDto } from './create-vision-board-item.dto';

export class UpdateVisionBoardItemDto extends PartialType(CreateVisionBoardItemDto) {}
