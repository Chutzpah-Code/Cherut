import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LifeAreasService } from './life-areas.service';
import { FirebaseService } from '../../config/firebase.service';

describe('LifeAreasService', () => {
  let service: LifeAreasService;

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    add: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockFirebaseService = { getFirestore: jest.fn(() => mockFirestore) };

  const USER = 'user-123';
  const AREA_ID = 'area-1';

  const mockArea = {
    userId: USER,
    name: 'Health',
    color: '#22c55e',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const docOf = (id: string, data: object) => ({ exists: true, id, data: () => data });
  const snap = (items: { id: string; data: object }[]) => ({
    docs: items.map((d) => ({ id: d.id, data: () => d.data })),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LifeAreasService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    service = module.get<LifeAreasService>(LifeAreasService);

    jest.resetAllMocks();
    mockFirestore.collection.mockReturnThis();
    mockFirestore.where.mockReturnThis();
    mockFirestore.doc.mockReturnThis();
    mockFirebaseService.getFirestore.mockReturnValue(mockFirestore);
  });

  describe('create', () => {
    it('creates life area with userId and strips undefined fields', async () => {
      mockFirestore.add.mockResolvedValue({ id: AREA_ID });

      const result = await service.create(USER, { name: 'Health', description: undefined } as any) as any;

      const added = mockFirestore.add.mock.calls[0][0];
      expect(added.userId).toBe(USER);
      expect(added.name).toBe('Health');
      expect('description' in added).toBe(false);
      expect(result.id).toBe(AREA_ID);
    });
  });

  describe('findAll', () => {
    it('returns all life areas for user', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([{ id: AREA_ID, data: mockArea }]),
      );

      const result = await service.findAll(USER) as any[];

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(AREA_ID);
    });
  });

  describe('findOne', () => {
    it('returns life area when found and owned', async () => {
      mockFirestore.get.mockResolvedValue(docOf(AREA_ID, mockArea));

      const result = await service.findOne(USER, AREA_ID) as any;

      expect(result.id).toBe(AREA_ID);
    });

    it('throws NotFoundException when not found', async () => {
      mockFirestore.get.mockResolvedValue({ exists: false });

      await expect(service.findOne(USER, 'ghost')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for wrong owner', async () => {
      mockFirestore.get.mockResolvedValue(docOf(AREA_ID, { ...mockArea, userId: 'other' }));

      await expect(service.findOne(USER, AREA_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates life area and returns refreshed doc', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(AREA_ID, mockArea))
        .mockResolvedValueOnce(docOf(AREA_ID, { ...mockArea, name: 'Wellbeing' }));
      mockFirestore.update.mockResolvedValue(undefined);

      const result = await service.update(USER, AREA_ID, { name: 'Wellbeing' } as any) as any;

      expect(mockFirestore.update).toHaveBeenCalled();
      expect(result.name).toBe('Wellbeing');
    });
  });

  describe('remove', () => {
    it('deletes life area and returns success message', async () => {
      mockFirestore.get.mockResolvedValue(docOf(AREA_ID, mockArea));
      mockFirestore.delete.mockResolvedValue(undefined);

      const result = await service.remove(USER, AREA_ID);

      expect(mockFirestore.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Life area deleted successfully' });
    });
  });
});
