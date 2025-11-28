import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FirebaseModule } from '../../config/firebase.module';

/**
 * Admin Module
 *
 * Isolated module for administrative functionalities
 * Includes all necessary dependencies
 */

@Module({
  imports: [FirebaseModule], // Import Firebase module for dependencies
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService], // Export for use in other modules if needed
})
export class AdminModule {}