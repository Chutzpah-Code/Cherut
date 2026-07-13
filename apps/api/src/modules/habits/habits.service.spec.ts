import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { FirebaseService } from '../../config/firebase.service';

describe('HabitsService', () => {
  let service: HabitsService;

  const mockBatch = { delete: jest.fn(), commit: jest.fn() };

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    add: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    batch: jest.fn().mockReturnValue(mockBatch),
    count: jest.fn().mockReturnThis(),
  };

  const mockFirebaseService = { getFirestore: jest.fn(() => mockFirestore) };

  const USER = 'user-123';

  const mockHabit = {
    id: 'habit-1',
    userId: USER,
    name: 'Exercise',
    type: 'boolean',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const docOf = (id: string, data: object) => ({
    exists: true,
    id,
    data: () => data,
  });

  const snap = (items: { id: string; data: object }[]) => ({
    docs: items.map((d) => ({ id: d.id, data: () => d.data, ref: d })),
    empty: items.length === 0,
  });

  const countSnap = (n: number) => ({ data: () => ({ count: n }) });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitsService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    service = module.get<HabitsService>(HabitsService);

    jest.resetAllMocks();
    mockFirestore.collection.mockReturnThis();
    mockFirestore.where.mockReturnThis();
    mockFirestore.orderBy.mockReturnThis();
    mockFirestore.limit.mockReturnThis();
    mockFirestore.doc.mockReturnThis();
    mockFirestore.count.mockReturnThis();
    mockFirestore.batch.mockReturnValue(mockBatch);
    mockBatch.commit.mockResolvedValue(undefined);
    mockFirebaseService.getFirestore.mockReturnValue(mockFirestore);
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates habit with userId and isActive=true', async () => {
      mockFirestore.add.mockResolvedValue({ id: 'habit-1' });

      const result = await service.create(USER, { name: 'Exercise', type: 'boolean' } as any) as any;

      const added = mockFirestore.add.mock.calls[0][0];
      expect(added.userId).toBe(USER);
      expect(added.isActive).toBe(true);
      expect(result.id).toBe('habit-1');
    });

    it('strips undefined fields before writing to Firestore', async () => {
      mockFirestore.add.mockResolvedValue({ id: 'habit-2' });

      await service.create(USER, { name: 'Run', type: 'boolean', description: undefined } as any);

      const added = mockFirestore.add.mock.calls[0][0];
      expect('description' in added).toBe(false);
    });
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('filters by isActive=true for active habits', async () => {
      mockFirestore.get.mockResolvedValue(snap([{ id: 'h1', data: { name: 'Run' } }]));

      await service.findAll(USER);

      expect(mockFirestore.where).toHaveBeenCalledWith('isActive', '==', true);
    });

    it('filters by isActive=false when archived=true', async () => {
      mockFirestore.get.mockResolvedValue(snap([]));

      await service.findAll(USER, undefined, true);

      expect(mockFirestore.where).toHaveBeenCalledWith('isActive', '==', false);
    });

    it('filters by lifeAreaId when provided', async () => {
      mockFirestore.get.mockResolvedValue(snap([]));

      await service.findAll(USER, 'area-1');

      expect(mockFirestore.where).toHaveBeenCalledWith('lifeAreaId', '==', 'area-1');
    });

    it('returns mapped docs', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([{ id: 'h1', data: { name: 'Exercise', userId: USER } }]),
      );

      const result = await service.findAll(USER) as any[];

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('h1');
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns habit when found and owned', async () => {
      mockFirestore.get.mockResolvedValue(docOf('habit-1', mockHabit));

      const result = await service.findOne(USER, 'habit-1') as any;

      expect(result.id).toBe('habit-1');
    });

    it('throws NotFoundException when not found', async () => {
      mockFirestore.get.mockResolvedValue({ exists: false });

      await expect(service.findOne(USER, 'ghost')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for wrong owner', async () => {
      mockFirestore.get.mockResolvedValue(docOf('habit-1', { ...mockHabit, userId: 'other' }));

      await expect(service.findOne(USER, 'habit-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates habit and returns refreshed doc', async () => {
      const updated = { ...mockHabit, name: 'Run' };
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', mockHabit))
        .mockResolvedValueOnce(docOf('habit-1', updated));

      const result = await service.update(USER, 'habit-1', { name: 'Run' } as any) as any;

      expect(mockFirestore.update).toHaveBeenCalled();
      expect(result.name).toBe('Run');
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes habit and all its logs in batch', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', mockHabit))   // findOne
        .mockResolvedValueOnce(snap([{ id: 'log-1', data: {} }])); // logs query

      const result = await service.remove(USER, 'habit-1');

      expect(mockBatch.delete).toHaveBeenCalledTimes(2); // habit + log
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Habit deleted successfully' });
    });

    it('deletes habit with no logs', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', mockHabit))
        .mockResolvedValueOnce(snap([]));

      await service.remove(USER, 'habit-1');

      expect(mockBatch.delete).toHaveBeenCalledTimes(1); // only habit
    });
  });

  // ─── logHabit ───────────────────────────────────────────────────────────────

  describe('logHabit', () => {
    const logDto = { habitId: 'habit-1', date: '2024-01-15', completed: true };

    it('creates a new log when none exists for the date', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', mockHabit)) // findOne
        .mockResolvedValueOnce({ empty: true, docs: [] })   // findLogByDate
        .mockResolvedValueOnce(undefined);                  // lastCompletedAt update (doc().update)
      mockFirestore.add.mockResolvedValue({ id: 'log-new' });
      mockFirestore.update.mockResolvedValue(undefined);

      const result = await service.logHabit(USER, logDto as any) as any;

      expect(mockFirestore.add).toHaveBeenCalled();
      expect(result.id).toBe('log-new');
    });

    it('updates existing log when one already exists for the date', async () => {
      const existingLog = { id: 'log-existing', data: { ...logDto, userId: USER } };
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', mockHabit))
        .mockResolvedValueOnce(snap([existingLog]));
      mockFirestore.update.mockResolvedValue(undefined);

      const result = await service.logHabit(USER, logDto as any) as any;

      expect(mockFirestore.update).toHaveBeenCalled();
      expect(result.id).toBe('log-existing');
    });

    it('updates lastCompletedAt when completed and date is newer', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', { ...mockHabit, lastCompletedAt: '2024-01-10' }))
        .mockResolvedValueOnce({ empty: true, docs: [] });
      mockFirestore.add.mockResolvedValue({ id: 'log-1' });
      mockFirestore.update.mockResolvedValue(undefined);

      await service.logHabit(USER, { habitId: 'habit-1', date: '2024-01-15', completed: true } as any);

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ lastCompletedAt: '2024-01-15' }),
      );
    });

    it('does NOT update lastCompletedAt when date is older than existing', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', { ...mockHabit, lastCompletedAt: '2024-01-20' }))
        .mockResolvedValueOnce({ empty: true, docs: [] });
      mockFirestore.add.mockResolvedValue({ id: 'log-1' });

      await service.logHabit(USER, { habitId: 'habit-1', date: '2024-01-10', completed: true } as any);

      expect(mockFirestore.update).not.toHaveBeenCalled();
    });

    it('does NOT update lastCompletedAt when completed=false', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', { ...mockHabit, type: 'counter' }))
        .mockResolvedValueOnce({ empty: true, docs: [] });
      mockFirestore.add.mockResolvedValue({ id: 'log-1' });

      await service.logHabit(USER, { habitId: 'habit-1', date: '2024-01-15', value: 5 } as any);

      expect(mockFirestore.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException for boolean habit without completed field', async () => {
      mockFirestore.get.mockResolvedValue(docOf('habit-1', mockHabit));

      await expect(
        service.logHabit(USER, { habitId: 'habit-1', date: '2024-01-15' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for counter habit without value field', async () => {
      mockFirestore.get.mockResolvedValue(
        docOf('habit-1', { ...mockHabit, type: 'counter' }),
      );

      await expect(
        service.logHabit(USER, { habitId: 'habit-1', date: '2024-01-15', completed: true } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for duration habit without value field', async () => {
      mockFirestore.get.mockResolvedValue(
        docOf('habit-1', { ...mockHabit, type: 'duration' }),
      );

      await expect(
        service.logHabit(USER, { habitId: 'habit-1', date: '2024-01-15' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── getHabitLogs ────────────────────────────────────────────────────────────

  describe('getHabitLogs', () => {
    it('returns logs ordered by date', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', mockHabit))  // findOne ownership check
        .mockResolvedValueOnce(
          snap([
            { id: 'log-2', data: { date: '2024-01-20' } },
            { id: 'log-1', data: { date: '2024-01-10' } },
          ]),
        );

      const result = await service.getHabitLogs(USER, 'habit-1') as any[];

      expect(result).toHaveLength(2);
    });

    it('applies startDate and endDate filters', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', mockHabit))
        .mockResolvedValueOnce(snap([]));

      await service.getHabitLogs(USER, 'habit-1', '2024-01-01', '2024-01-31');

      expect(mockFirestore.where).toHaveBeenCalledWith('date', '>=', '2024-01-01');
      expect(mockFirestore.where).toHaveBeenCalledWith('date', '<=', '2024-01-31');
    });
  });

  // ─── toggleArchive ───────────────────────────────────────────────────────────

  describe('toggleArchive', () => {
    it('archives an active habit', async () => {
      const archivedHabit = { ...mockHabit, isActive: false };
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', mockHabit))
        .mockResolvedValueOnce(docOf('habit-1', archivedHabit));

      const result = await service.toggleArchive(USER, 'habit-1') as any;

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
      expect(result.isActive).toBe(false);
    });

    it('restores an archived habit', async () => {
      const archivedHabit = { ...mockHabit, isActive: false };
      const restoredHabit = { ...mockHabit, isActive: true };
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', archivedHabit))
        .mockResolvedValueOnce(docOf('habit-1', restoredHabit));

      const result = await service.toggleArchive(USER, 'habit-1') as any;

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
      expect(result.isActive).toBe(true);
    });
  });

  // ─── getHabitCounts ──────────────────────────────────────────────────────────

  describe('getHabitCounts', () => {
    it('returns active, archived, and total counts', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(countSnap(5))   // active count
        .mockResolvedValueOnce(countSnap(2));  // archived count

      const result = await service.getHabitCounts(USER) as any;

      expect(result).toEqual({ active: 5, archived: 2, total: 7 });
    });
  });

  // ─── permanentDelete ─────────────────────────────────────────────────────────

  describe('permanentDelete', () => {
    it('deletes habit and all logs permanently', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf('habit-1', mockHabit))
        .mockResolvedValueOnce(snap([{ id: 'log-1', data: {} }, { id: 'log-2', data: {} }]));

      const result = await service.permanentDelete(USER, 'habit-1');

      expect(mockBatch.delete).toHaveBeenCalledTimes(3); // habit + 2 logs
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Habit permanently deleted successfully' });
    });
  });
});
