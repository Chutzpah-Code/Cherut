import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { LifeAreasService } from './life-areas.service';
import { FirebaseService } from '../../config/firebase.service';
import { ObjectivesService } from '../objectives/objectives.service';
import { HabitsService } from '../habits/habits.service';
import { TasksService } from '../tasks/tasks.service';
import { PRESET_LIFE_AREAS } from './constants/preset-life-areas';

describe('LifeAreasService', () => {
  let service: LifeAreasService;

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    batch: jest.fn(),
    add: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockFirebaseService = { getFirestore: jest.fn(() => mockFirestore) };
  const mockObjectivesService = { findAll: jest.fn(), remove: jest.fn() };
  const mockHabitsService = { findAll: jest.fn(), remove: jest.fn() };
  const mockTasksService = { findAll: jest.fn(), remove: jest.fn() };

  const USER = 'user-123';
  const AREA_ID = 'area-1';

  const mockArea = {
    userId: USER,
    name: 'Health',
    color: '#22c55e',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const docOf = (id: string, data: object) => ({
    exists: true,
    id,
    data: () => data,
  });
  const snap = (items: { id: string; data: object }[]) => ({
    docs: items.map((d) => ({ id: d.id, data: () => d.data })),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LifeAreasService,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: ObjectivesService, useValue: mockObjectivesService },
        { provide: HabitsService, useValue: mockHabitsService },
        { provide: TasksService, useValue: mockTasksService },
      ],
    }).compile();

    service = module.get<LifeAreasService>(LifeAreasService);

    jest.resetAllMocks();
    mockFirestore.collection.mockReturnThis();
    mockFirestore.where.mockReturnThis();
    mockFirestore.doc.mockReturnThis();
    mockFirestore.limit.mockReturnThis();
    mockFirebaseService.getFirestore.mockReturnValue(mockFirestore);
    mockObjectivesService.findAll.mockResolvedValue([]);
    mockHabitsService.findAll.mockResolvedValue([]);
    mockTasksService.findAll.mockResolvedValue([]);
  });

  describe('create', () => {
    it('creates life area with userId and strips undefined fields', async () => {
      mockFirestore.add.mockResolvedValue({ id: AREA_ID });

      const result = (await service.create(USER, {
        name: 'Health',
        description: undefined,
      } as any)) as any;

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

      const result = (await service.findAll(USER)) as any[];

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(AREA_ID);
    });
  });

  describe('findOne', () => {
    it('returns life area when found and owned', async () => {
      mockFirestore.get.mockResolvedValue(docOf(AREA_ID, mockArea));

      const result = (await service.findOne(USER, AREA_ID)) as any;

      expect(result.id).toBe(AREA_ID);
    });

    it('throws NotFoundException when not found', async () => {
      mockFirestore.get.mockResolvedValue({ exists: false });

      await expect(service.findOne(USER, 'ghost')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException for wrong owner', async () => {
      mockFirestore.get.mockResolvedValue(
        docOf(AREA_ID, { ...mockArea, userId: 'other' }),
      );

      await expect(service.findOne(USER, AREA_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates life area and returns refreshed doc', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(AREA_ID, mockArea))
        .mockResolvedValueOnce(
          docOf(AREA_ID, { ...mockArea, name: 'Wellbeing' }),
        );
      mockFirestore.update.mockResolvedValue(undefined);

      const result = (await service.update(USER, AREA_ID, {
        name: 'Wellbeing',
      } as any)) as any;

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

    it('throws ForbiddenException for preset life areas and never deletes', async () => {
      mockFirestore.get.mockResolvedValue(
        docOf(AREA_ID, { ...mockArea, isSystemPreset: true }),
      );

      await expect(service.remove(USER, AREA_ID)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockFirestore.delete).not.toHaveBeenCalled();
    });

    it('cascades delete to linked objectives, active+archived habits and tasks', async () => {
      mockFirestore.get.mockResolvedValue(docOf(AREA_ID, mockArea));
      mockFirestore.delete.mockResolvedValue(undefined);
      mockObjectivesService.findAll.mockResolvedValue([{ id: 'obj-1' }]);
      mockHabitsService.findAll
        .mockResolvedValueOnce([{ id: 'habit-active' }])
        .mockResolvedValueOnce([{ id: 'habit-archived' }]);
      mockTasksService.findAll.mockResolvedValue([{ id: 'task-1' }]);

      await service.remove(USER, AREA_ID);

      expect(mockObjectivesService.remove).toHaveBeenCalledWith(USER, 'obj-1');
      expect(mockHabitsService.remove).toHaveBeenCalledWith(
        USER,
        'habit-active',
      );
      expect(mockHabitsService.remove).toHaveBeenCalledWith(
        USER,
        'habit-archived',
      );
      expect(mockTasksService.remove).toHaveBeenCalledWith(USER, 'task-1');
      expect(mockHabitsService.findAll).toHaveBeenCalledWith(
        USER,
        AREA_ID,
        false,
      );
      expect(mockHabitsService.findAll).toHaveBeenCalledWith(
        USER,
        AREA_ID,
        true,
      );
      expect(mockFirestore.delete).toHaveBeenCalled();
    });
  });

  describe('update — preset life areas', () => {
    const presetArea = {
      ...mockArea,
      isSystemPreset: true,
      presetSlug: 'finances',
      nameOverridden: false,
    };

    it('allows renaming and marks nameOverridden', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(AREA_ID, presetArea))
        .mockResolvedValueOnce(
          docOf(AREA_ID, {
            ...presetArea,
            name: 'My Finances',
            nameOverridden: true,
          }),
        );
      mockFirestore.update.mockResolvedValue(undefined);

      const result = (await service.update(USER, AREA_ID, {
        name: 'My Finances',
      } as any)) as any;

      const updates = mockFirestore.update.mock.calls[0][0];
      expect(updates.name).toBe('My Finances');
      expect(updates.nameOverridden).toBe(true);
      expect(result.name).toBe('My Finances');
    });

    it('rejects changes to description/icon/color', async () => {
      mockFirestore.get.mockResolvedValue(docOf(AREA_ID, presetArea));

      await expect(
        service.update(USER, AREA_ID, { description: 'nope' } as any),
      ).rejects.toThrow(BadRequestException);
      expect(mockFirestore.update).not.toHaveBeenCalled();
    });
  });

  describe('getImpact', () => {
    it('returns counts and items grouped per module', async () => {
      mockFirestore.get.mockResolvedValue(docOf(AREA_ID, mockArea));
      mockObjectivesService.findAll.mockResolvedValue([
        { id: 'obj-1', title: 'Objective A' },
      ]);
      mockHabitsService.findAll
        .mockResolvedValueOnce([{ id: 'habit-1', title: 'Habit A' }])
        .mockResolvedValueOnce([]);
      mockTasksService.findAll.mockResolvedValue([]);

      const impact = await service.getImpact(USER, AREA_ID);

      expect(impact.objectives).toEqual({
        count: 1,
        items: [{ id: 'obj-1', title: 'Objective A' }],
      });
      expect(impact.habits).toEqual({
        count: 1,
        items: [{ id: 'habit-1', title: 'Habit A' }],
      });
      expect(impact.tasks).toEqual({ count: 0, items: [] });
    });
  });

  describe('seedDefaults', () => {
    it('skips seeding when the user already has preset life areas', async () => {
      mockFirestore.get.mockResolvedValue({ empty: false });

      await service.seedDefaults(USER);

      expect(mockFirestore.batch).not.toHaveBeenCalled();
    });

    it('seeds every preset life area when none exist yet', async () => {
      mockFirestore.get.mockResolvedValue({ empty: true });
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      mockFirestore.batch.mockReturnValue(mockBatch);

      await service.seedDefaults(USER);

      expect(mockBatch.set).toHaveBeenCalledTimes(PRESET_LIFE_AREAS.length);
      expect(mockBatch.commit).toHaveBeenCalled();

      const [, firstDoc] = mockBatch.set.mock.calls[0];
      expect(firstDoc.isSystemPreset).toBe(true);
      expect(firstDoc.nameOverridden).toBe(false);
      expect(firstDoc.userId).toBe(USER);
      expect(firstDoc.presetSlug).toBe(PRESET_LIFE_AREAS[0].slug);
    });
  });
});
