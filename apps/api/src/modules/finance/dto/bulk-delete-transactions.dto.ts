import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class BulkDeleteTransactionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}
