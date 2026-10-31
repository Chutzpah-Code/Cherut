import { Module } from '@nestjs/common';
import { LifeAreasController } from './life-areas.controller';
import { LifeAreasService } from './life-areas.service';
import { ObjectivesModule } from '../objectives/objectives.module';
import { HabitsModule } from '../habits/habits.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [ObjectivesModule, HabitsModule, TasksModule],
  controllers: [LifeAreasController],
  providers: [LifeAreasService],
  exports: [LifeAreasService],
})
export class LifeAreasModule {}
