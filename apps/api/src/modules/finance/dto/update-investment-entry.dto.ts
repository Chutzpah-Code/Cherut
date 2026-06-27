import { PartialType } from '@nestjs/mapped-types';
import { CreateInvestmentEntryDto } from './create-investment-entry.dto';
export class UpdateInvestmentEntryDto extends PartialType(CreateInvestmentEntryDto) {}
