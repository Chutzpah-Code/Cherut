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
  Logger,
} from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto, UpdateObjectiveDto, CreateKeyResultDto, UpdateKeyResultDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('objectives')
@UseGuards(FirebaseAuthGuard)
export class ObjectivesController {
  private readonly logger = new Logger(ObjectivesController.name);

  constructor(private readonly objectivesService: ObjectivesService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateObjectiveDto) {
    try {
      this.logger.log(`🎯 Creating objective for user: ${req.user.uid}`);
      this.logger.log(`📝 Objective data: ${JSON.stringify(createDto, null, 2)}`);

      const result = await this.objectivesService.create(req.user.uid, createDto);

      this.logger.log(`✅ Objective created successfully: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error creating objective for user ${req.user.uid}:`, error);
      this.logger.error(`📋 Failed data: ${JSON.stringify(createDto, null, 2)}`);
      throw error;
    }
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
