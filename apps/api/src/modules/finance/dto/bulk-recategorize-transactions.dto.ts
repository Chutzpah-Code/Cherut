import { IsArray, IsString, IsOptional, ArrayNotEmpty } from 'class-validator';

export class BulkRecategorizeTransactionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];

  // Omit or send null to move the selected transactions to Uncategorized.
  @IsString()
  @IsOptional()
  categoryId?: string | null;
}
