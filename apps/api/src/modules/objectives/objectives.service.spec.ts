import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { FirebaseService } from '../../config/firebase.service';

describe('ObjectivesService', () => {
  let service: ObjectivesService;

  const mockBatch = { delete: jest.fn(), commit: jest.fn() };
  const mockTransaction = { get: jest.fn(), update: jest.fn(), delete: jest.fn() };

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
    runTransaction: jest.fn(),
  };

  const mockFirebaseService = { getFirestore: jest.fn(() => mockFirestore) };

  const USER = 'user-123';
  const OBJ_ID = 'obj-1';

  const mockObjective = {
    userId: USER,
    title: 'Grow Revenue',
    status: 'active',
    progress: 0,
    isActive: true,
    isArchived: false,
    cycleMonths: 3,
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-04-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const docOf = (id: string, data: object) => ({
    exists: true, id, data: () => data,
  });

  const snap = (items: { id: string; data: object }[]) => ({
    docs: items.map((d) => ({ id: d.id, data: () => d.data, ref: { id: d.id } })),
    empty: items.length === 0,
  });

  const emptySnap = () => snap([]);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectivesService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    service = module.get<ObjectivesService>(ObjectivesService);

    jest.resetAllMocks();
    mockFirestore.collection.mockReturnThis();
    mockFirestore.where.mockReturnThis();
    mockFirestore.orderBy.mockReturnThis();
    mockFirestore.limit.mockReturnThis();
    mockFirestore.doc.mockReturnThis();
    mockFirestore.batch.mockReturnValue(mockBatch);
    mockBatch.commit.mockResolvedValue(undefined);
    mockFirebaseService.getFirestore.mockReturnValue(mockFirestore);
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates objective with userId, status=active and progress=0', async () => {
      // add objective → get key results (empty) → return
      mockFirestore.add.mockResolvedValue({ id: OBJ_ID });
      mockFirestore.get.mockResolvedValue(emptySnap());

      const result = await service.create(USER, { title: 'Grow Revenue' } as any) as any;

      const added = mockFirestore.add.mock.calls[0][0];
      expect(added.userId).toBe(USER);
      expect(added.status).toBe('active');
      expect(added.progress).toBe(0);
      expect(result.id).toBe(OBJ_ID);
    });

    it('defaults cycleMonths to 3', async () => {
      mockFirestore.add.mockResolvedValue({ id: OBJ_ID });
      mockFirestore.get.mockResolvedValue(emptySnap());

      await service.create(USER, { title: 'OKR' } as any);

      expect(mockFirestore.add.mock.calls[0][0].cycleMonths).toBe(3);
    });

    it('respects explicit cycleMonths', async () => {
      mockFirestore.add.mockResolvedValue({ id: OBJ_ID });
      mockFirestore.get.mockResolvedValue(emptySnap());

      await service.create(USER, { title: 'OKR', cycleMonths: 12 } as any);

      expect(mockFirestore.add.mock.calls[0][0].cycleMonths).toBe(12);
    });
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns objectives with their key results attached', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(snap([{ id: OBJ_ID, data: mockObjective }]))       // objectives
        .mockResolvedValueOnce(snap([                                              // key results (in query)
          { id: 'kr-1', data: { objectiveId: OBJ_ID, targetValue: 100, currentValue: 50 } },
        ]));

      const result = await service.findAll(USER) as any[];

      expect(result).toHaveLength(1);
      expect(result[0].keyResults).toHaveLength(1);
      expect(result[0].keyResults[0].completionPercentage).toBe(50);
    });

    it('filters by lifeAreaId when provided', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(snap([]))
        .mockResolvedValueOnce(snap([]));

      await service.findAll(USER, 'area-1');

      expect(mockFirestore.where).toHaveBeenCalledWith('lifeAreaId', '==', 'area-1');
    });

    it('returns empty array when no objectives exist', async () => {
      mockFirestore.get.mockResolvedValue(snap([]));

      const result = await service.findAll(USER) as any[];

      expect(result).toHaveLength(0);
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns objective with key results', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(OBJ_ID, mockObjective))    // objective
        .mockResolvedValueOnce(emptySnap());                     // key results

      const result = await service.findOne(USER, OBJ_ID) as any;

      expect(result.id).toBe(OBJ_ID);
      expect(result.keyResults).toEqual([]);
    });

    it('computes completionPercentage for key results', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(OBJ_ID, mockObjective))
        .mockResolvedValueOnce(snap([
          { id: 'kr-1', data: { objectiveId: OBJ_ID, targetValue: 200, currentValue: 100 } },
        ]));

      const result = await service.findOne(USER, OBJ_ID) as any;

      expect(result.keyResults[0].completionPercentage).toBe(50);
    });

    it('throws NotFoundException when not found', async () => {
      mockFirestore.get.mockResolvedValue({ exists: false });

      await expect(service.findOne(USER, 'ghost')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for wrong owner', async () => {
      mockFirestore.get.mockResolvedValue(docOf(OBJ_ID, { ...mockObjective, userId: 'other' }));

      await expect(service.findOne(USER, OBJ_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates objective and returns refreshed doc', async () => {
      const updated = { ...mockObjective, title: 'New Title' };
      // findOne (initial) → findOne (after update, called twice each: doc + KRs)
      mockFirestore.get
        .mockResolvedValueOnce(docOf(OBJ_ID, mockObjective))
        .mockResolvedValueOnce(emptySnap())
        .mockResolvedValueOnce(docOf(OBJ_ID, updated))
        .mockResolvedValueOnce(emptySnap());
      mockFirestore.update.mockResolvedValue(undefined);

      const result = await service.update(USER, OBJ_ID, { title: 'New Title' } as any) as any;

      expect(mockFirestore.update).toHaveBeenCalled();
      expect(result.title).toBe('New Title');
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes objective and all its key results', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(OBJ_ID, mockObjective))   // findOne
        .mockResolvedValueOnce(emptySnap())                     // findOne → KRs
        .mockResolvedValueOnce(snap([{ id: 'kr-1', data: {} }])); // KRs to delete

      mockFirestore.delete.mockResolvedValue(undefined);

      const result = await service.remove(USER, OBJ_ID);

      expect(mockBatch.delete).toHaveBeenCalledTimes(1); // 1 KR
      expect(mockFirestore.delete).toHaveBeenCalled();   // objective
      expect(result).toEqual({ message: 'Objective deleted successfully' });
    });
  });

  // ─── toggleObjectiveCompletion ───────────────────────────────────────────────

  describe('toggleObjectiveCompletion', () => {
    it('marks active objective as completed', async () => {
      const completedObj = { ...mockObjective, status: 'completed' };
      mockFirestore.get
        .mockResolvedValueOnce(docOf(OBJ_ID, mockObjective))
        .mockResolvedValueOnce(emptySnap())
        .mockResolvedValueOnce(docOf(OBJ_ID, completedObj))
        .mockResolvedValueOnce(emptySnap());
      mockFirestore.update.mockResolvedValue(undefined);

      const result = await service.toggleObjectiveCompletion(USER, OBJ_ID) as any;

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'completed' }),
      );
      expect(result.status).toBe('completed');
    });
  });
});
