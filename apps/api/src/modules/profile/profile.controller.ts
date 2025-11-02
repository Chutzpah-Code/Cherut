import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('profile')
@UseGuards(FirebaseAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateProfileDto) {
    return this.profileService.create(req.user.uid, createDto);
  }

  @Get()
  findOne(@Request() req) {
    return this.profileService.findOne(req.user.uid);
  }

  @Patch()
  update(@Request() req, @Body() updateDto: UpdateProfileDto) {
    return this.profileService.update(req.user.uid, updateDto);
  }

  @Delete()
  remove(@Request() req) {
    return this.profileService.remove(req.user.uid);
  }
}
