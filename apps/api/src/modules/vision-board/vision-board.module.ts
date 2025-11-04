import { Module } from '@nestjs/common';
import { VisionBoardService } from './vision-board.service';
import { VisionBoardController } from './vision-board.controller';
import { FirebaseModule } from '../../config/firebase.module';
import { CloudinaryService } from '../../config/cloudinary.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [FirebaseModule, AuthModule],
  controllers: [VisionBoardController],
  providers: [VisionBoardService, CloudinaryService],
  exports: [VisionBoardService],
})
export class VisionBoardModule {}
