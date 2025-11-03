import { Module } from '@nestjs/common';
import { EnterpriseWaitlistController } from './enterprise-waitlist.controller';
import { EnterpriseWaitlistService } from './enterprise-waitlist.service';
import { FirebaseModule } from '../config/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [EnterpriseWaitlistController],
  providers: [EnterpriseWaitlistService],
})
export class EnterpriseWaitlistModule {}
