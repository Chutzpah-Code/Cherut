import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('journal')
@UseGuards(FirebaseAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateJournalEntryDto) {
    return this.journalService.create(req.user.uid, createDto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('archived') archived?: string,
  ) {
    return this.journalService.findAll(
      req.user.uid,
      search,
      archived === 'true'
    );
  }

  @Get('counts')
  getJournalCounts(@Request() req) {
    return this.journalService.getJournalCounts(req.user.uid);
  }

  @Get('search/date')
  searchByDate(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.journalService.searchByDate(req.user.uid, startDate, endDate);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.journalService.findOne(req.user.uid, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateJournalEntryDto,
  ) {
    return this.journalService.update(req.user.uid, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.journalService.remove(req.user.uid, id);
  }

  @Patch(':id/archive')
  toggleArchive(@Request() req, @Param('id') id: string) {
    return this.journalService.toggleArchive(req.user.uid, id);
  }
}