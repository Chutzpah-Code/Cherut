import { Module } from '@nestjs/common';
import { VisionBoardService } from './vision-board.service';
import { VisionBoardController } from './vision-board.controller';
import { CloudinaryService } from '../../config/cloudinary.service';

@Module({
  imports: [], // FirebaseModule é global, AuthModule não é necessário aqui
  controllers: [VisionBoardController],
  providers: [VisionBoardService, CloudinaryService],
  exports: [VisionBoardService],
})
export class VisionBoardModule {}
