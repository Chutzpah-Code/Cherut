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
import { ValuesService } from './values.service';
import { CreateValueDto, UpdateValueDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('values')
@UseGuards(FirebaseAuthGuard)
export class ValuesController {
  constructor(private readonly valuesService: ValuesService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateValueDto) {
    return this.valuesService.create(req.user.uid, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.valuesService.findAll(req.user.uid);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.valuesService.findOne(req.user.uid, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateValueDto,
  ) {
    return this.valuesService.update(req.user.uid, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.valuesService.remove(req.user.uid, id);
  }
}