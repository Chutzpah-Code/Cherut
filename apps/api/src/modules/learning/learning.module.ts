import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { CloudinaryService } from '../../config/cloudinary.service';

@Module({
  imports: [], // FirebaseModule is global; AuthModule not needed here
  controllers: [LearningController],
  providers: [LearningService, CloudinaryService],
  exports: [LearningService],
})
export class LearningModule {}
