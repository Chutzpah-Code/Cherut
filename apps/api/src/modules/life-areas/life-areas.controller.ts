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
} from '@nestjs/common';
import { LifeAreasService } from './life-areas.service';
import { CreateLifeAreaDto, UpdateLifeAreaDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('life-areas')
@UseGuards(FirebaseAuthGuard)
export class LifeAreasController {
  constructor(private readonly lifeAreasService: LifeAreasService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateLifeAreaDto) {
    return this.lifeAreasService.create(req.user.uid, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.lifeAreasService.findAll(req.user.uid);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.lifeAreasService.findOne(req.user.uid, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateLifeAreaDto,
  ) {
    return this.lifeAreasService.update(req.user.uid, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.lifeAreasService.remove(req.user.uid, id);
  }
}
