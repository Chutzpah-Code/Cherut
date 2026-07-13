import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { KeyResultsService } from './key-results.service';
import { FirebaseService } from '../../config/firebase.service';

describe('KeyResultsService', () => {
  let service: KeyResultsService;

  const mockTransaction = {
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    add: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    runTransaction: jest.fn(),
  };

  const mockFirebaseService = { getFirestore: jest.fn(() => mockFirestore) };

  const USER = 'user-123';
  const KR_ID = 'kr-1';
  const OBJ_ID = 'obj-1';

  const mockKR = {
    userId: USER,
    objectiveId: OBJ_ID,
    title: 'Reach $1M ARR',
    currentValue: 500000,
    targetValue: 1000000,
    completionPercentage: 50,
    order: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const docOf = (id: string, data: object) => ({
    exists: true, id, data: () => data,
  });

  const snap = (items: { id: string; data: object }[]) => ({
    docs: items.map((d) => ({ id: d.id, data: () => d.data, ref: { id: d.id } })),
    empty: items.length === 0,
    size: items.length,
  });

  const countSnap = (n: number) => ({ data: () => ({ count: n }) });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeyResultsService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    service = module.get<KeyResultsService>(KeyResultsService);

    jest.resetAllMocks();
    mockFirestore.collection.mockReturnThis();
    mockFirestore.where.mockReturnThis();
    mockFirestore.doc.mockReturnThis();
    mockFirebaseService.getFirestore.mockReturnValue(mockFirestore);
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates key result with userId and computed completionPercentage', async () => {
      // verifyObjectiveOwnership → get objective doc
      mockFirestore.get.mockResolvedValueOnce(docOf(OBJ_ID, { userId: USER }));
      mockFirestore.add.mockResolvedValue({ id: KR_ID });

      const result = await service.create(USER, {
        objectiveId: OBJ_ID, title: 'Hit $1M', currentValue: 250, targetValue: 1000,
      } as any) as any;

      const added = mockFirestore.add.mock.calls[0][0];
      expect(added.userId).toBe(USER);
      expect(added.completionPercentage).toBe(25);
      expect(result.id).toBe(KR_ID);
    });

    it('defaults currentValue to 0 when omitted', async () => {
      mockFirestore.get.mockResolvedValueOnce(docOf(OBJ_ID, { userId: USER }));
      mockFirestore.add.mockResolvedValue({ id: KR_ID });

      await service.create(USER, { objectiveId: OBJ_ID, title: 'KR', targetValue: 100 } as any);

      expect(mockFirestore.add.mock.calls[0][0].currentValue).toBe(0);
    });
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all KRs for user', async () => {
      mockFirestore.get.mockResolvedValue(snap([{ id: KR_ID, data: mockKR }]));

      const result = await service.findAll(USER) as any[];

      expect(result).toHaveLength(1);
    });

    it('filters by objectiveId when provided', async () => {
      mockFirestore.get.mockResolvedValue(snap([]));

      await service.findAll(USER, OBJ_ID);

      expect(mockFirestore.where).toHaveBeenCalledWith('objectiveId', '==', OBJ_ID);
    });
  });

  // ─── findAllByObjectiveIds ───────────────────────────────────────────────────

  describe('findAllByObjectiveIds', () => {
    it('returns empty array for empty input', async () => {
      const result = await service.findAllByObjectiveIds(USER, []);
      expect(result).toEqual([]);
      expect(mockFirestore.get).not.toHaveBeenCalled();
    });

    it('queries using "in" operator with provided ids', async () => {
      mockFirestore.get.mockResolvedValue(snap([{ id: KR_ID, data: mockKR }]));

      const result = await service.findAllByObjectiveIds(USER, [OBJ_ID]) as any[];

      expect(mockFirestore.where).toHaveBeenCalledWith('objectiveId', 'in', [OBJ_ID]);
      expect(result).toHaveLength(1);
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns key result when found and owned', async () => {
      mockFirestore.get.mockResolvedValue(docOf(KR_ID, mockKR));

      const result = await service.findOne(USER, KR_ID) as any;

      expect(result.id).toBe(KR_ID);
    });

    it('throws NotFoundException when not found', async () => {
      mockFirestore.get.mockResolvedValue({ exists: false });

      await expect(service.findOne(USER, 'ghost')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for wrong owner', async () => {
      mockFirestore.get.mockResolvedValue(docOf(KR_ID, { ...mockKR, userId: 'other' }));

      await expect(service.findOne(USER, KR_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('recalculates completionPercentage when currentValue changes', async () => {
      const docRef = { id: KR_ID };
      mockFirestore.doc.mockReturnValue(docRef);
      mockFirestore.runTransaction.mockImplementation(async (fn: any) => {
        mockTransaction.get.mockResolvedValue(docOf(KR_ID, mockKR));
        return fn(mockTransaction);
      });

      const result = await service.update(USER, KR_ID, { currentValue: 750000 } as any) as any;

      const updated = mockTransaction.update.mock.calls[0][1];
      expect(updated.completionPercentage).toBe(75);
    });

    it('throws NotFoundException when KR not found in transaction', async () => {
      mockFirestore.runTransaction.mockImplementation(async (fn: any) => {
        mockTransaction.get.mockResolvedValue({ exists: false });
        return fn(mockTransaction);
      });

      await expect(service.update(USER, 'ghost', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('throws BadRequestException when removing would go below minimum KRs', async () => {
      // findOne
      mockFirestore.get
        .mockResolvedValueOnce(docOf(KR_ID, mockKR))
        // countKeyResultsByObjective
        .mockResolvedValueOnce(snap([
          { id: 'kr-1', data: {} }, { id: 'kr-2', data: {} }, { id: 'kr-3', data: {} },
        ]));

      await expect(service.remove(USER, KR_ID)).rejects.toThrow(BadRequestException);
    });

    it('deletes KR when count is above minimum', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(KR_ID, mockKR))
        .mockResolvedValueOnce(snap([
          { id: 'kr-1', data: {} }, { id: 'kr-2', data: {} },
          { id: 'kr-3', data: {} }, { id: 'kr-4', data: {} },
        ]));
      mockFirestore.delete.mockResolvedValue(undefined);

      const result = await service.remove(USER, KR_ID);

      expect(mockFirestore.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Key Result deleted successfully' });
    });
  });
});
