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
import { ActionPlansService } from './action-plans.service';
import { CreateActionPlanDto, UpdateActionPlanDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('action-plans')
@UseGuards(JwtAuthGuard)
export class ActionPlansController {
  constructor(private readonly actionPlansService: ActionPlansService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateActionPlanDto) {
    return this.actionPlansService.create(req.user.uid, createDto);
  }

  @Get()
  findAll(@Request() req, @Query('keyResultId') keyResultId?: string) {
    return this.actionPlansService.findAll(req.user.uid, keyResultId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.actionPlansService.findOne(req.user.uid, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateActionPlanDto,
  ) {
    return this.actionPlansService.update(req.user.uid, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.actionPlansService.remove(req.user.uid, id);
  }
}
