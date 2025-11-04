import { IsString, IsNotEmpty, IsOptional, IsUrl, MaxLength, IsDateString } from 'class-validator';

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
}
