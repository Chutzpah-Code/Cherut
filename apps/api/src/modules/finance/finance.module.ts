import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { CloudinaryService } from '../../config/cloudinary.service';
import { BillsModule } from '../bills/bills.module';

@Module({
  imports: [BillsModule],
  controllers: [FinanceController],
  providers: [FinanceService, CloudinaryService],
})
export class FinanceModule {}
