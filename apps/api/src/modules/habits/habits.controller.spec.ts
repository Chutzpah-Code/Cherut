import { Test, TestingModule } from '@nestjs/testing';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

describe('HabitsController', () => {
  let controller: HabitsController;
  let service: HabitsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getHabitCounts: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    logHabit: jest.fn(),
    getHabitLogs: jest.fn(),
    toggleArchive: jest.fn(),
    permanentDelete: jest.fn(),
  };

  const req = { user: { uid: 'user-123' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HabitsController],
      providers: [{ provide: HabitsService, useValue: mockService }],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<HabitsController>(HabitsController);
    service = module.get<HabitsService>(HabitsService);
    jest.clearAllMocks();
  });

  describe('authentication', () => {
    it('should be protected by FirebaseAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', HabitsController);
      expect(guards).toContain(FirebaseAuthGuard);
    });
  });

  describe('create', () => {
    it('passes uid and dto to service', async () => {
      const dto = { name: 'Exercise', type: 'boolean' } as any;
      mockService.create.mockResolvedValue({ id: 'h1' });
      await controller.create(req, dto);
      expect(service.create).toHaveBeenCalledWith('user-123', dto);
    });
  });

  describe('findAll', () => {
    it('passes archived=true when query is "true"', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll(req, undefined, 'true');
      expect(service.findAll).toHaveBeenCalledWith('user-123', undefined, true);
    });

    it('passes archived=false when query is absent', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll(req);
      expect(service.findAll).toHaveBeenCalledWith('user-123', undefined, false);
    });

    it('passes lifeAreaId when provided', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll(req, 'area-1');
      expect(service.findAll).toHaveBeenCalledWith('user-123', 'area-1', false);
    });
  });

  describe('getHabitCounts', () => {
    it('passes uid and optional lifeAreaId', async () => {
      mockService.getHabitCounts.mockResolvedValue({ active: 3, archived: 1, total: 4 });
      await controller.getHabitCounts(req, 'area-1');
      expect(service.getHabitCounts).toHaveBeenCalledWith('user-123', 'area-1');
    });
  });

  describe('findOne', () => {
    it('passes uid and id', async () => {
      mockService.findOne.mockResolvedValue({ id: 'h1' });
      await controller.findOne(req, 'h1');
      expect(service.findOne).toHaveBeenCalledWith('user-123', 'h1');
    });
  });

  describe('update', () => {
    it('passes uid, id and dto', async () => {
      const dto = { name: 'Run' } as any;
      mockService.update.mockResolvedValue({ id: 'h1' });
      await controller.update(req, 'h1', dto);
      expect(service.update).toHaveBeenCalledWith('user-123', 'h1', dto);
    });
  });

  describe('remove', () => {
    it('passes uid and id', async () => {
      mockService.remove.mockResolvedValue({ message: 'Habit deleted successfully' });
      await controller.remove(req, 'h1');
      expect(service.remove).toHaveBeenCalledWith('user-123', 'h1');
    });
  });

  describe('logHabit', () => {
    it('passes uid and log dto', async () => {
      const dto = { habitId: 'h1', date: '2024-01-15', completed: true } as any;
      mockService.logHabit.mockResolvedValue({ id: 'log-1' });
      await controller.logHabit(req, dto);
      expect(service.logHabit).toHaveBeenCalledWith('user-123', dto);
    });
  });

  describe('getHabitLogs', () => {
    it('passes uid, id and date filters', async () => {
      mockService.getHabitLogs.mockResolvedValue([]);
      await controller.getHabitLogs(req, 'h1', '2024-01-01', '2024-01-31');
      expect(service.getHabitLogs).toHaveBeenCalledWith('user-123', 'h1', '2024-01-01', '2024-01-31');
    });
  });

  describe('toggleArchive', () => {
    it('passes uid and id', async () => {
      mockService.toggleArchive.mockResolvedValue({ id: 'h1', isActive: false });
      await controller.toggleArchive(req, 'h1');
      expect(service.toggleArchive).toHaveBeenCalledWith('user-123', 'h1');
    });
  });

  describe('permanentDelete', () => {
    it('passes uid and id', async () => {
      mockService.permanentDelete.mockResolvedValue({ message: 'Habit permanently deleted successfully' });
      await controller.permanentDelete(req, 'h1');
      expect(service.permanentDelete).toHaveBeenCalledWith('user-123', 'h1');
    });
  });
});
