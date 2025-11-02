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
import { KeyResultsService } from './key-results.service';
import { CreateKeyResultDto, UpdateKeyResultDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('key-results')
@UseGuards(FirebaseAuthGuard)
export class KeyResultsController {
  constructor(private readonly keyResultsService: KeyResultsService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateKeyResultDto) {
    return this.keyResultsService.create(req.user.uid, createDto);
  }

  @Get()
  findAll(@Request() req, @Query('objectiveId') objectiveId?: string) {
    return this.keyResultsService.findAll(req.user.uid, objectiveId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.keyResultsService.findOne(req.user.uid, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateKeyResultDto,
  ) {
    return this.keyResultsService.update(req.user.uid, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.keyResultsService.remove(req.user.uid, id);
  }
}
