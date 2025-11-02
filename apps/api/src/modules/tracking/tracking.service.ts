import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { LifeAreasService } from '../life-areas/life-areas.service';
import { ObjectivesService } from '../objectives/objectives.service';
import { KeyResultsService } from '../key-results/key-results.service';
import { ActionPlansService } from '../action-plans/action-plans.service';
import { HabitsService } from '../habits/habits.service';
import { TrackingQueryDto, TimeRange } from './dto';

@Injectable()
export class TrackingService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly lifeAreasService: LifeAreasService,
    private readonly objectivesService: ObjectivesService,
    private readonly keyResultsService: KeyResultsService,
    private readonly actionPlansService: ActionPlansService,
    private readonly habitsService: HabitsService,
  ) {}

  /**
   * Dashboard Overview - High-level metrics
   */
  async getDashboard(userId: string, query: TrackingQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    const [
      lifeAreas,
      objectives,
      keyResults,
      actionPlans,
      habits,
      habitLogs,
    ] = await Promise.all([
      this.lifeAreasService.findAll(userId),
      this.objectivesService.findAll(userId),
      this.keyResultsService.findAll(userId),
      this.actionPlansService.findAll(userId),
      this.habitsService.findAll(userId),
      this.getHabitLogsInRange(userId, startDate, endDate),
    ]);

    // Calculate completion rates
    const objectivesCompletion = this.calculateCompletion(objectives);
    const keyResultsCompletion = this.calculateCompletion(keyResults);
    const actionPlansCompletion = this.calculateCompletion(actionPlans);
    const habitsCompletion = this.calculateHabitsCompletion(habitLogs);

    return {
      summary: {
        totalLifeAreas: lifeAreas.length,
        activeObjectives: objectives.filter((o) => o.status === 'in_progress')
          .length,
        totalObjectives: objectives.length,
        totalKeyResults: keyResults.length,
        totalActionPlans: actionPlans.length,
        totalHabits: habits.length,
      },
      completion: {
        objectives: objectivesCompletion,
        keyResults: keyResultsCompletion,
        actionPlans: actionPlansCompletion,
        habits: habitsCompletion,
      },
      timeRange: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Life Area Progress - Detailed metrics per life area
   */
  async getLifeAreaProgress(
    userId: string,
    lifeAreaId: string,
    query: TrackingQueryDto,
  ) {
    const { startDate, endDate } = this.getDateRange(query);

    const [lifeArea, objectives, habits] = await Promise.all([
      this.lifeAreasService.findOne(userId, lifeAreaId),
      this.objectivesService.findAll(userId, lifeAreaId),
      this.habitsService.findAll(userId, lifeAreaId),
    ]);

    const keyResultsPromises = objectives.map((obj) =>
      this.keyResultsService.findAll(userId, obj.id),
    );
    const allKeyResults = (await Promise.all(keyResultsPromises)).flat();

    const actionPlansPromises = allKeyResults.map((kr) =>
      this.actionPlansService.findAll(userId, kr.id),
    );
    const allActionPlans = (await Promise.all(actionPlansPromises)).flat();

    return {
      lifeArea,
      metrics: {
        objectives: {
          total: objectives.length,
          byStatus: this.groupByStatus(objectives),
          completion: this.calculateCompletion(objectives),
        },
        keyResults: {
          total: allKeyResults.length,
          completion: this.calculateCompletion(allKeyResults),
        },
        actionPlans: {
          total: allActionPlans.length,
          byStatus: this.groupByStatus(allActionPlans),
          completion: this.calculateCompletion(allActionPlans),
        },
        habits: {
          total: habits.length,
          active: habits.filter((h) => h.isActive !== false).length,
        },
      },
      timeRange: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Objective Progress - Detailed OKR metrics
   */
  async getObjectiveProgress(
    userId: string,
    objectiveId: string,
    query: TrackingQueryDto,
  ) {
    const { startDate, endDate } = this.getDateRange(query);

    const [objective, keyResults] = await Promise.all([
      this.objectivesService.findOne(userId, objectiveId),
      this.keyResultsService.findAll(userId, objectiveId),
    ]);

    const actionPlansPromises = keyResults.map((kr) =>
      this.actionPlansService.findAll(userId, kr.id),
    );
    const allActionPlans = (await Promise.all(actionPlansPromises)).flat();

    // Calculate overall objective completion based on KR progress
    const avgKeyResultProgress =
      keyResults.length > 0
        ? keyResults.reduce(
            (sum, kr) =>
              sum + ((kr.currentValue || 0) / kr.targetValue) * 100,
            0,
          ) / keyResults.length
        : 0;

    return {
      objective,
      overallProgress: Math.min(avgKeyResultProgress, 100),
      keyResults: keyResults.map((kr) => ({
        ...kr,
        progress: ((kr.currentValue || 0) / kr.targetValue) * 100,
        actionPlansCount: allActionPlans.filter(
          (ap) => ap.keyResultId === kr.id,
        ).length,
      })),
      actionPlans: {
        total: allActionPlans.length,
        byStatus: this.groupByStatus(allActionPlans),
        completion: this.calculateCompletion(allActionPlans),
      },
      timeRange: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Habits Analytics - Tracking and streaks
   */
  async getHabitsAnalytics(userId: string, query: TrackingQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    const habits = await this.habitsService.findAll(
      userId,
      query.lifeAreaId,
    );

    const habitsWithStats = await Promise.all(
      habits.map(async (habit) => {
        const logs = await this.habitsService.getHabitLogs(
          userId,
          habit.id,
          startDate,
          endDate,
        );

        const streak = this.calculateStreak(logs);
        const completionRate = this.calculateHabitCompletionRate(
          habit,
          logs,
          startDate,
          endDate,
        );

        return {
          ...habit,
          stats: {
            totalLogs: logs.length,
            currentStreak: streak.current,
            longestStreak: streak.longest,
            completionRate,
          },
        };
      }),
    );

    return {
      habits: habitsWithStats,
      timeRange: {
        startDate,
        endDate,
      },
    };
  }

  // Helper Methods

  private getDateRange(query: TrackingQueryDto): {
    startDate: string;
    endDate: string;
  } {
    const now = new Date();
    let startDate: Date;
    const endDate = new Date(now);

    if (query.timeRange === TimeRange.CUSTOM) {
      return {
        startDate: query.startDate || this.formatDate(new Date()),
        endDate: query.endDate || this.formatDate(now),
      };
    }

    switch (query.timeRange) {
      case TimeRange.WEEK:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case TimeRange.MONTH:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case TimeRange.QUARTER:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case TimeRange.YEAR:
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        // Default to last 30 days
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
    }

    return {
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private calculateCompletion(items: any[]): number {
    if (items.length === 0) return 0;

    const completed = items.filter((item) => item.status === 'completed')
      .length;
    return Math.round((completed / items.length) * 100);
  }

  private groupByStatus(items: any[]): Record<string, number> {
    return items.reduce(
      (acc, item) => {
        const status = item.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private async getHabitLogsInRange(
    userId: string,
    startDate: string,
    endDate: string,
  ) {
    const db = this.firebaseService.getFirestore();

    const snapshot = await db
      .collection('habitLogs')
      .where('userId', '==', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  private calculateHabitsCompletion(logs: any[]): number {
    if (logs.length === 0) return 0;

    const completed = logs.filter(
      (log) => log.completed === true || (log.value && log.value > 0),
    ).length;
    return Math.round((completed / logs.length) * 100);
  }

  private calculateStreak(logs: any[]): {
    current: number;
    longest: number;
  } {
    if (logs.length === 0) return { current: 0, longest: 0 };

    // Sort logs by date descending
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = this.formatDate(new Date());
    const yesterday = this.formatDate(
      new Date(Date.now() - 24 * 60 * 60 * 1000),
    );

    // Calculate current streak
    for (let i = 0; i < sortedLogs.length; i++) {
      const log = sortedLogs[i];
      const isCompleted = log.completed === true || (log.value && log.value > 0);

      if (!isCompleted) break;

      if (i === 0 && (log.date === today || log.date === yesterday)) {
        currentStreak++;
      } else if (i > 0) {
        const prevDate = new Date(sortedLogs[i - 1].date);
        const currDate = new Date(log.date);
        const diffDays = Math.floor(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (const log of sortedLogs) {
      const isCompleted = log.completed === true || (log.value && log.value > 0);

      if (isCompleted) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return {
      current: currentStreak,
      longest: longestStreak,
    };
  }

  private calculateHabitCompletionRate(
    habit: any,
    logs: any[],
    startDate: string,
    endDate: string,
  ): number {
    // Calculate expected occurrences based on frequency
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    let expectedOccurrences = 0;

    switch (habit.frequency) {
      case 'daily':
        expectedOccurrences = daysDiff;
        break;
      case 'weekly':
        expectedOccurrences = Math.floor(daysDiff / 7);
        break;
      case 'monthly':
        expectedOccurrences = Math.floor(daysDiff / 30);
        break;
    }

    if (expectedOccurrences === 0) return 0;

    const completedLogs = logs.filter(
      (log) => log.completed === true || (log.value && log.value > 0),
    ).length;

    return Math.round((completedLogs / expectedOccurrences) * 100);
  }
}
