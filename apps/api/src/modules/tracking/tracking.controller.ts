import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingQueryDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

/**
 * Tracking Controller
 *
 * Endpoints for metrics and progress visualization:
 * - GET /tracking/dashboard → Overall dashboard metrics
 * - GET /tracking/life-areas/:id → Life area detailed progress
 * - GET /tracking/objectives/:id → Objective OKR metrics
 * - GET /tracking/habits → Habits analytics and streaks
 */
@Controller('tracking')
@UseGuards(FirebaseAuthGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('dashboard')
  getDashboard(@Request() req, @Query() query: TrackingQueryDto) {
    return this.trackingService.getDashboard(req.user.uid, query);
  }

  @Get('life-areas/:id')
  getLifeAreaProgress(
    @Request() req,
    @Param('id') id: string,
    @Query() query: TrackingQueryDto,
  ) {
    return this.trackingService.getLifeAreaProgress(req.user.uid, id, query);
  }

  @Get('objectives/:id')
  getObjectiveProgress(
    @Request() req,
    @Param('id') id: string,
    @Query() query: TrackingQueryDto,
  ) {
    return this.trackingService.getObjectiveProgress(req.user.uid, id, query);
  }

  @Get('habits')
  getHabitsAnalytics(@Request() req, @Query() query: TrackingQueryDto) {
    return this.trackingService.getHabitsAnalytics(req.user.uid, query);
  }
}
