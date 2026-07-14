import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { FirebaseModule } from './config/firebase.module';
import cloudinaryConfig from './config/cloudinary.config';
import { AuthModule } from './modules/auth/auth.module';
import { LifeAreasModule } from './modules/life-areas/life-areas.module';
import { ObjectivesModule } from './modules/objectives/objectives.module';
import { KeyResultsModule } from './modules/key-results/key-results.module';
import { ProfileModule } from './modules/profile/profile.module';
import { HabitsModule } from './modules/habits/habits.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { VisionBoardModule } from './modules/vision-board/vision-board.module';
import { AdminModule } from './modules/admin/admin.module';
import { JournalModule } from './modules/journal/journal.module';
import { ValuesModule } from './modules/values/values.module';
import { BoardsModule } from './modules/boards/boards.module';
import { FinanceModule } from './modules/finance/finance.module';
import { BillsModule } from './modules/bills/bills.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', load: [cloudinaryConfig] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    FirebaseModule,
    AuthModule,
    ProfileModule,
    LifeAreasModule,
    ObjectivesModule,
    KeyResultsModule,
    HabitsModule,
    TrackingModule,
    TasksModule,
    VisionBoardModule,
    AdminModule,
    JournalModule,
    ValuesModule,
    BoardsModule,
    FinanceModule,
    BillsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: ValidationExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
