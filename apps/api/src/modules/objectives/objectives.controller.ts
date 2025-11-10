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
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto, UpdateObjectiveDto, CreateKeyResultDto, UpdateKeyResultDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('objectives')
@UseGuards(FirebaseAuthGuard)
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateObjectiveDto) {
    return this.objectivesService.create(req.user.uid, createDto);
  }

  @Get()
  findAll(@Request() req, @Query('lifeAreaId') lifeAreaId?: string) {
    return this.objectivesService.findAll(req.user.uid, lifeAreaId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.objectivesService.findOne(req.user.uid, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateObjectiveDto,
  ) {
    return this.objectivesService.update(req.user.uid, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.objectivesService.remove(req.user.uid, id);
  }

  // Key Results endpoints
  @Post(':objectiveId/key-results')
  createKeyResult(
    @Request() req,
    @Param('objectiveId') objectiveId: string,
    @Body() createDto: CreateKeyResultDto,
  ) {
    return this.objectivesService.createKeyResult(req.user.uid, objectiveId, createDto);
  }

  @Get(':objectiveId/key-results')
  getKeyResults(
    @Request() req,
    @Param('objectiveId') objectiveId: string,
  ) {
    return this.objectivesService.getKeyResultsForObjective(req.user.uid, objectiveId);
  }

  @Patch(':objectiveId/key-results/:keyResultId')
  updateKeyResult(
    @Request() req,
    @Param('objectiveId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
    @Body() updateDto: UpdateKeyResultDto,
  ) {
    return this.objectivesService.updateKeyResult(
      req.user.uid,
      objectiveId,
      keyResultId,
      updateDto,
    );
  }

  @Delete(':objectiveId/key-results/:keyResultId')
  deleteKeyResult(
    @Request() req,
    @Param('objectiveId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
  ) {
    return this.objectivesService.deleteKeyResult(
      req.user.uid,
      objectiveId,
      keyResultId,
    );
  }

  // Toggle completion endpoints
  @Patch(':id/toggle-completion')
  toggleObjectiveCompletion(@Request() req, @Param('id') id: string) {
    return this.objectivesService.toggleObjectiveCompletion(req.user.uid, id);
  }

  @Patch(':objectiveId/key-results/:keyResultId/toggle-completion')
  toggleKeyResultCompletion(
    @Request() req,
    @Param('objectiveId') objectiveId: string,
    @Param('keyResultId') keyResultId: string,
  ) {
    return this.objectivesService.toggleKeyResultCompletion(
      req.user.uid,
      objectiveId,
      keyResultId,
    );
  }

  // Archive endpoint
  @Patch(':id/archive')
  archiveObjective(@Request() req, @Param('id') id: string) {
    return this.objectivesService.archiveObjective(req.user.uid, id);
  }
}
