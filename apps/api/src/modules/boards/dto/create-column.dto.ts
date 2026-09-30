import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // A sort key, not an index — the frontend inserts columns via midpoint
  // math (see computeMidpointOrder in ManageBoardModal.tsx) and can
  // legitimately need a negative value to place a column before the
  // current first one (e.g. next order 0 with nothing before it → -1).
  @IsNumber()
  @IsOptional()
  order?: number;
}
