import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from './tracking.service';
import { FirebaseService } from '../../config/firebase.service';
import { LifeAreasService } from '../life-areas/life-areas.service';
import { ObjectivesService } from '../objectives/objectives.service';
import { KeyResultsService } from '../key-results/key-results.service';
import { HabitsService } from '../habits/habits.service';
import { TimeRange } from './dto';

describe('TrackingService', () => {
  let service: TrackingService;

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
  };

  const mockFirebaseService = { getFirestore: jest.fn(() => mockFirestore) };
  const mockLifeAreasService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockObjectivesService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockKeyResultsService = { findAll: jest.fn(), findAllByObjectiveIds: jest.fn() };
  const mockHabitsService = { findAll: jest.fn() };

  const USER = 'user-123';

  const snap = (items: object[]) => ({
    docs: items.map((d: any, i) => ({ id: `log-${i}`, data: () => d })),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: LifeAreasService, useValue: mockLifeAreasService },
        { provide: ObjectivesService, useValue: mockObjectivesService },
        { provide: KeyResultsService, useValue: mockKeyResultsService },
        { provide: HabitsService, useValue: mockHabitsService },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);

    jest.resetAllMocks();
    mockFirestore.collection.mockReturnThis();
    mockFirestore.where.mockReturnThis();
    mockFirebaseService.getFirestore.mockReturnValue(mockFirestore);
  });

  // ─── getDashboard ─────────────────────────────────────────────────────────────

  describe('getDashboard', () => {
    it('aggregates summary counts from all services', async () => {
      mockLifeAreasService.findAll.mockResolvedValue([{}, {}]);
      mockObjectivesService.findAll.mockResolvedValue([
        { id: 'o1', status: 'in_progress' },
        { id: 'o2', status: 'completed' },
      ]);
      mockKeyResultsService.findAll.mockResolvedValue([{}, {}, {}]);
      mockHabitsService.findAll.mockResolvedValue([{}]);
      mockFirestore.get.mockResolvedValue(snap([]));

      const result = await service.getDashboard(USER, { timeRange: TimeRange.MONTH });

      expect(result.summary.totalLifeAreas).toBe(2);
      expect(result.summary.activeObjectives).toBe(1);
      expect(result.summary.totalObjectives).toBe(2);
      expect(result.summary.totalKeyResults).toBe(3);
      expect(result.summary.totalHabits).toBe(1);
    });

    it('returns 0% completion when no objectives', async () => {
      mockLifeAreasService.findAll.mockResolvedValue([]);
      mockObjectivesService.findAll.mockResolvedValue([]);
      mockKeyResultsService.findAll.mockResolvedValue([]);
      mockHabitsService.findAll.mockResolvedValue([]);
      mockFirestore.get.mockResolvedValue(snap([]));

      const result = await service.getDashboard(USER, { timeRange: TimeRange.WEEK });

      expect(result.completion.objectives).toBe(0);
      expect(result.completion.keyResults).toBe(0);
    });

    it('calculates objective completion as percent with status=completed', async () => {
      mockLifeAreasService.findAll.mockResolvedValue([]);
      mockObjectivesService.findAll.mockResolvedValue([
        { status: 'completed' },
        { status: 'completed' },
        { status: 'active' },
        { status: 'active' },
      ]);
      mockKeyResultsService.findAll.mockResolvedValue([]);
      mockHabitsService.findAll.mockResolvedValue([]);
      mockFirestore.get.mockResolvedValue(snap([]));

      const result = await service.getDashboard(USER, { timeRange: TimeRange.MONTH });

      expect(result.completion.objectives).toBe(50);
    });

    it('includes timeRange in response', async () => {
      mockLifeAreasService.findAll.mockResolvedValue([]);
      mockObjectivesService.findAll.mockResolvedValue([]);
      mockKeyResultsService.findAll.mockResolvedValue([]);
      mockHabitsService.findAll.mockResolvedValue([]);
      mockFirestore.get.mockResolvedValue(snap([]));

      const result = await service.getDashboard(USER, { timeRange: TimeRange.WEEK });

      expect(result.timeRange).toHaveProperty('startDate');
      expect(result.timeRange).toHaveProperty('endDate');
    });
  });

  // ─── getLifeAreaProgress ──────────────────────────────────────────────────────

  describe('getLifeAreaProgress', () => {
    it('returns metrics for all KRs belonging to objectives in the area', async () => {
      const AREA_ID = 'area-1';
      mockLifeAreasService.findOne.mockResolvedValue({ id: AREA_ID, name: 'Health' });
      mockObjectivesService.findAll.mockResolvedValue([{ id: 'o1' }, { id: 'o2' }]);
      mockHabitsService.findAll.mockResolvedValue([{ isActive: true }, { isActive: false }]);
      mockKeyResultsService.findAllByObjectiveIds.mockResolvedValue([
        { status: 'completed' }, { status: 'active' },
      ]);

      const result = await service.getLifeAreaProgress(USER, AREA_ID, { timeRange: TimeRange.MONTH });

      expect(result.metrics.objectives.total).toBe(2);
      expect(result.metrics.keyResults.total).toBe(2);
      expect(result.metrics.habits.total).toBe(2);
      expect(result.metrics.habits.active).toBe(1); // isActive !== false
    });

    it('fetches KRs using all objective ids from the area', async () => {
      mockLifeAreasService.findOne.mockResolvedValue({ id: 'area-1' });
      mockObjectivesService.findAll.mockResolvedValue([{ id: 'o1' }, { id: 'o2' }]);
      mockHabitsService.findAll.mockResolvedValue([]);
      mockKeyResultsService.findAllByObjectiveIds.mockResolvedValue([]);

      await service.getLifeAreaProgress(USER, 'area-1', { timeRange: TimeRange.WEEK });

      expect(mockKeyResultsService.findAllByObjectiveIds).toHaveBeenCalledWith(USER, ['o1', 'o2']);
    });
  });

  // ─── getObjectiveProgress ─────────────────────────────────────────────────────

  describe('getObjectiveProgress', () => {
    it('computes average KR progress as overallProgress', async () => {
      mockObjectivesService.findOne.mockResolvedValue({ id: 'o1', title: 'Grow' });
      mockKeyResultsService.findAll.mockResolvedValue([
        { currentValue: 50, targetValue: 100 },
        { currentValue: 100, targetValue: 200 },
      ]);

      const result = await service.getObjectiveProgress(USER, 'o1', { timeRange: TimeRange.MONTH });

      // (50%) + (50%) / 2 = 50%
      expect(result.overallProgress).toBe(50);
    });

    it('returns 0 overallProgress when no KRs', async () => {
      mockObjectivesService.findOne.mockResolvedValue({ id: 'o1' });
      mockKeyResultsService.findAll.mockResolvedValue([]);

      const result = await service.getObjectiveProgress(USER, 'o1', { timeRange: TimeRange.MONTH });

      expect(result.overallProgress).toBe(0);
    });

    it('clamps overallProgress to 100', async () => {
      mockObjectivesService.findOne.mockResolvedValue({ id: 'o1' });
      mockKeyResultsService.findAll.mockResolvedValue([
        { currentValue: 200, targetValue: 100 }, // 200%
      ]);

      const result = await service.getObjectiveProgress(USER, 'o1', { timeRange: TimeRange.MONTH });

      expect(result.overallProgress).toBeLessThanOrEqual(100);
    });

    it('attaches per-KR progress field', async () => {
      mockObjectivesService.findOne.mockResolvedValue({ id: 'o1' });
      mockKeyResultsService.findAll.mockResolvedValue([
        { currentValue: 75, targetValue: 100 },
      ]);

      const result = await service.getObjectiveProgress(USER, 'o1', { timeRange: TimeRange.MONTH });

      expect(result.keyResults[0].progress).toBe(75);
    });
  });

  // ─── getHabitsAnalytics ───────────────────────────────────────────────────────

  describe('getHabitsAnalytics', () => {
    it('groups logs by habitId and attaches stats per habit', async () => {
      mockHabitsService.findAll.mockResolvedValue([
        { id: 'h1', frequency: 'daily' },
        { id: 'h2', frequency: 'daily' },
      ]);
      mockFirestore.get.mockResolvedValue(snap([
        { habitId: 'h1', date: '2024-01-01', completed: true },
        { habitId: 'h1', date: '2024-01-02', completed: true },
        { habitId: 'h2', date: '2024-01-01', completed: false },
      ]));

      const result = await service.getHabitsAnalytics(USER, { timeRange: TimeRange.MONTH });

      const h1 = result.habits.find((h: any) => h.id === 'h1');
      const h2 = result.habits.find((h: any) => h.id === 'h2');
      expect(h1.stats.totalLogs).toBe(2);
      expect(h2.stats.totalLogs).toBe(1);
    });

    it('passes lifeAreaId filter to habitsService when provided', async () => {
      mockHabitsService.findAll.mockResolvedValue([]);
      mockFirestore.get.mockResolvedValue(snap([]));

      await service.getHabitsAnalytics(USER, { timeRange: TimeRange.MONTH, lifeAreaId: 'area-1' });

      expect(mockHabitsService.findAll).toHaveBeenCalledWith(USER, 'area-1');
    });
  });
});
