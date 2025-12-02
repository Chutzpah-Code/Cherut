import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateJournalEntryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20000, { message: 'Content cannot exceed 20,000 characters' })
  content: string;
}