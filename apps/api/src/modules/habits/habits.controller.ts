import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto, UpdateHabitDto, LogHabitDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('habits')
@UseGuards(FirebaseAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateHabitDto) {
    return this.habitsService.create(req.user.uid, createDto);
  }

  @Get()
  findAll(@Request() req, @Query('lifeAreaId') lifeAreaId?: string) {
    return this.habitsService.findAll(req.user.uid, lifeAreaId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.habitsService.findOne(req.user.uid, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateHabitDto,
  ) {
    return this.habitsService.update(req.user.uid, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.habitsService.remove(req.user.uid, id);
  }

  // Habit Logging Routes
  @Post('log')
  logHabit(@Request() req, @Body() logDto: LogHabitDto) {
    return this.habitsService.logHabit(req.user.uid, logDto);
  }

  @Get(':id/logs')
  getHabitLogs(
    @Request() req,
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.habitsService.getHabitLogs(
      req.user.uid,
      id,
      startDate,
      endDate,
    );
  }
}
