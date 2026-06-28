import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
  }))
  uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.profileService.updateAvatar(req.user.uid, file);
  }
}
