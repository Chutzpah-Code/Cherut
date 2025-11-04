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
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

/**
 * Tasks Controller - Kanban-style task management
 *
 * Features:
 * - Standard CRUD operations
 * - Kanban board view (grouped by status)
 * - Task ordering (drag-and-drop)
 * - Pomodoro tracking
 * - Filtering by life area, action plan, status
 */
@Controller('tasks')
@UseGuards(FirebaseAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateTaskDto) {
    return this.tasksService.create(req.user.uid, createDto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('lifeAreaId') lifeAreaId?: string,
    @Query('actionPlanId') actionPlanId?: string,
    @Query('status') status?: string,
  ) {
    return this.tasksService.findAll(
      req.user.uid,
      lifeAreaId,
      actionPlanId,
      status,
    );
  }

  @Get('kanban')
  getKanbanBoard(@Request() req, @Query('lifeAreaId') lifeAreaId?: string) {
    return this.tasksService.getKanbanBoard(req.user.uid, lifeAreaId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.tasksService.findOne(req.user.uid, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(req.user.uid, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.tasksService.remove(req.user.uid, id);
  }

  @Patch(':id/order')
  updateOrder(
    @Request() req,
    @Param('id') id: string,
    @Body('newOrder') order: number,
    @Body('newStatus') status?: string,
  ) {
    return this.tasksService.updateOrder(req.user.uid, id, order, status);
  }

  @Post(':id/pomodoro')
  incrementPomodoro(@Request() req, @Param('id') id: string) {
    return this.tasksService.incrementPomodoro(req.user.uid, id);
  }

  @Post(':id/time-tracking/start')
  startTimeTracking(@Request() req, @Param('id') id: string) {
    return this.tasksService.startTimeTracking(req.user.uid, id);
  }

  @Patch(':id/time-tracking/:trackingId/pause')
  pauseTimeTracking(
    @Request() req,
    @Param('id') id: string,
    @Param('trackingId') trackingId: string,
  ) {
    return this.tasksService.pauseTimeTracking(req.user.uid, id, trackingId);
  }

  @Patch(':id/time-tracking/:trackingId/stop')
  stopTimeTracking(
    @Request() req,
    @Param('id') id: string,
    @Param('trackingId') trackingId: string,
  ) {
    return this.tasksService.stopTimeTracking(req.user.uid, id, trackingId);
  }

  @Delete(':id/time-tracking/:trackingId/cancel')
  cancelTimeTracking(
    @Request() req,
    @Param('id') id: string,
    @Param('trackingId') trackingId: string,
  ) {
    return this.tasksService.cancelTimeTracking(req.user.uid, id, trackingId);
  }

  @Patch(':id/checklist/:checklistItemId/toggle')
  toggleChecklistItem(
    @Request() req,
    @Param('id') id: string,
    @Param('checklistItemId') checklistItemId: string,
  ) {
    return this.tasksService.toggleChecklistItem(
      req.user.uid,
      id,
      checklistItemId,
    );
  }

  @Patch(':id/archive')
  toggleArchive(@Request() req, @Param('id') id: string) {
    return this.tasksService.toggleArchive(req.user.uid, id);
  }
}
