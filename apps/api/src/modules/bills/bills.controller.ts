import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto, UpdateBillDto, PayOccurrenceDto, UpdateOccurrenceDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('bills')
@UseGuards(FirebaseAuthGuard)
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  // Bills
  @Post()
  createBill(@Request() req, @Body() dto: CreateBillDto) {
    return this.billsService.createBill(req.user.uid, dto);
  }

  @Get()
  listBills(@Request() req) {
    return this.billsService.listBills(req.user.uid);
  }

  @Patch(':id')
  updateBill(@Request() req, @Param('id') id: string, @Body() dto: UpdateBillDto) {
    return this.billsService.updateBill(req.user.uid, id, dto);
  }

  @Delete(':id')
  deleteBill(@Request() req, @Param('id') id: string) {
    return this.billsService.deleteBill(req.user.uid, id);
  }

  // Occurrences
  @Get('occurrences')
  getOccurrences(@Request() req, @Query('month') month: string) {
    const m = month ?? new Date().toISOString().slice(0, 7);
    return this.billsService.getOccurrences(req.user.uid, m);
  }

  @Post('occurrences/:id/pay')
  payOccurrence(@Request() req, @Param('id') id: string, @Body() dto: PayOccurrenceDto) {
    return this.billsService.payOccurrence(req.user.uid, id, dto);
  }

  @Patch('occurrences/:id')
  updateOccurrence(@Request() req, @Param('id') id: string, @Body() dto: UpdateOccurrenceDto) {
    return this.billsService.updateOccurrence(req.user.uid, id, dto);
  }

  @Delete('occurrences/:id')
  deleteOccurrence(@Request() req, @Param('id') id: string) {
    return this.billsService.deleteOccurrence(req.user.uid, id);
  }
}
