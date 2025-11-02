import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { LifeAreasModule } from '../life-areas/life-areas.module';
import { ObjectivesModule } from '../objectives/objectives.module';
import { KeyResultsModule } from '../key-results/key-results.module';
import { ActionPlansModule } from '../action-plans/action-plans.module';
import { HabitsModule } from '../habits/habits.module';

@Module({
  imports: [
    LifeAreasModule,
    ObjectivesModule,
    KeyResultsModule,
    ActionPlansModule,
    HabitsModule,
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
