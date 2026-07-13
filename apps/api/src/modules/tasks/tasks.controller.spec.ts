import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateOrder: jest.fn(),
    getKanbanBoard: jest.fn(),
    getTaskCounts: jest.fn(),
    startTimeTracking: jest.fn(),
    pauseTimeTracking: jest.fn(),
    stopTimeTracking: jest.fn(),
    cancelTimeTracking: jest.fn(),
    addManualTimeEntry: jest.fn(),
    editTimeEntry: jest.fn(),
    deleteTimeEntry: jest.fn(),
    toggleChecklistItem: jest.fn(),
    toggleArchive: jest.fn(),
    toggleRecurringDate: jest.fn(),
  };

  const req = { user: { uid: 'user-123' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockService }],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('authentication', () => {
    it('should be protected by FirebaseAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', TasksController);
      expect(guards).toContain(FirebaseAuthGuard);
    });
  });

  describe('create', () => {
    it('passes uid and dto to service', async () => {
      const dto = { title: 'Fix bug' } as any;
      mockService.create.mockResolvedValue({ id: 't1' });
      await controller.create(req, dto);
      expect(service.create).toHaveBeenCalledWith('user-123', dto);
    });
  });

  describe('findAll', () => {
    it('passes uid and optional filters', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll(req, 'area-1', 'todo', 'false');
      expect(service.findAll).toHaveBeenCalledWith('user-123', 'area-1', 'todo', false);
    });

    it('converts archived string "true" to boolean', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll(req, undefined, undefined, 'true');
      expect(service.findAll).toHaveBeenCalledWith('user-123', undefined, undefined, true);
    });
  });

  describe('getKanbanBoard', () => {
    it('passes uid and optional filters', async () => {
      mockService.getKanbanBoard.mockResolvedValue({ todo: [], in_progress: [], done: [] });
      await controller.getKanbanBoard(req, 'area-1', 'false');
      expect(service.getKanbanBoard).toHaveBeenCalledWith('user-123', 'area-1', false);
    });

    it('converts includeArchived "true" to boolean', async () => {
      mockService.getKanbanBoard.mockResolvedValue({});
      await controller.getKanbanBoard(req, undefined, 'true');
      expect(service.getKanbanBoard).toHaveBeenCalledWith('user-123', undefined, true);
    });
  });

  describe('getTaskCounts', () => {
    it('passes uid and optional lifeAreaId', async () => {
      mockService.getTaskCounts.mockResolvedValue({ active: 2, archived: 1, total: 3 });
      await controller.getTaskCounts(req, 'area-1');
      expect(service.getTaskCounts).toHaveBeenCalledWith('user-123', 'area-1');
    });
  });

  describe('findOne', () => {
    it('passes uid and id', async () => {
      mockService.findOne.mockResolvedValue({ id: 't1' });
      await controller.findOne(req, 't1');
      expect(service.findOne).toHaveBeenCalledWith('user-123', 't1');
    });
  });

  describe('update', () => {
    it('passes uid, id and dto', async () => {
      const dto = { title: 'Updated' } as any;
      mockService.update.mockResolvedValue({ id: 't1' });
      await controller.update(req, 't1', dto);
      expect(service.update).toHaveBeenCalledWith('user-123', 't1', dto);
    });
  });

  describe('remove', () => {
    it('passes uid and id', async () => {
      mockService.remove.mockResolvedValue({ message: 'Task deleted successfully' });
      await controller.remove(req, 't1');
      expect(service.remove).toHaveBeenCalledWith('user-123', 't1');
    });
  });

  describe('updateOrder', () => {
    it('passes uid, id, order, status and columnId', async () => {
      mockService.updateOrder.mockResolvedValue({ id: 't1' });
      await controller.updateOrder(req, 't1', 3, 'in_progress', 'col-1');
      expect(service.updateOrder).toHaveBeenCalledWith('user-123', 't1', 3, 'in_progress', 'col-1');
    });
  });

  describe('time tracking', () => {
    it('startTimeTracking passes uid and id', async () => {
      mockService.startTimeTracking.mockResolvedValue({ id: 't1' });
      await controller.startTimeTracking(req, 't1');
      expect(service.startTimeTracking).toHaveBeenCalledWith('user-123', 't1');
    });

    it('pauseTimeTracking passes uid, id and trackingId', async () => {
      mockService.pauseTimeTracking.mockResolvedValue({ id: 't1' });
      await controller.pauseTimeTracking(req, 't1', 'tr-1');
      expect(service.pauseTimeTracking).toHaveBeenCalledWith('user-123', 't1', 'tr-1');
    });

    it('stopTimeTracking passes uid, id and trackingId', async () => {
      mockService.stopTimeTracking.mockResolvedValue({ id: 't1' });
      await controller.stopTimeTracking(req, 't1', 'tr-1');
      expect(service.stopTimeTracking).toHaveBeenCalledWith('user-123', 't1', 'tr-1');
    });

    it('cancelTimeTracking passes uid, id and trackingId', async () => {
      mockService.cancelTimeTracking.mockResolvedValue({ message: 'cancelled' });
      await controller.cancelTimeTracking(req, 't1', 'tr-1');
      expect(service.cancelTimeTracking).toHaveBeenCalledWith('user-123', 't1', 'tr-1');
    });

    it('addManualTimeEntry passes uid, id and time range', async () => {
      mockService.addManualTimeEntry.mockResolvedValue({ id: 't1' });
      await controller.addManualTimeEntry(req, 't1', '2024-01-15T10:00:00Z', '2024-01-15T10:30:00Z');
      expect(service.addManualTimeEntry).toHaveBeenCalledWith('user-123', 't1', {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T10:30:00Z',
      });
    });

    it('editTimeEntry passes uid, id, trackingId and optional times', async () => {
      mockService.editTimeEntry.mockResolvedValue({ id: 't1' });
      await controller.editTimeEntry(req, 't1', 'tr-1', '2024-01-15T10:00:00Z', '2024-01-15T11:00:00Z');
      expect(service.editTimeEntry).toHaveBeenCalledWith('user-123', 't1', 'tr-1', {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
      });
    });

    it('deleteTimeEntry passes uid, id and trackingId', async () => {
      mockService.deleteTimeEntry.mockResolvedValue({ id: 't1' });
      await controller.deleteTimeEntry(req, 't1', 'tr-1');
      expect(service.deleteTimeEntry).toHaveBeenCalledWith('user-123', 't1', 'tr-1');
    });
  });

  describe('toggleChecklistItem', () => {
    it('passes uid, id and checklistItemId', async () => {
      mockService.toggleChecklistItem.mockResolvedValue({ id: 't1' });
      await controller.toggleChecklistItem(req, 't1', 'ci-1');
      expect(service.toggleChecklistItem).toHaveBeenCalledWith('user-123', 't1', 'ci-1');
    });
  });

  describe('toggleArchive', () => {
    it('passes uid and id', async () => {
      mockService.toggleArchive.mockResolvedValue({ id: 't1', archived: true });
      await controller.toggleArchive(req, 't1');
      expect(service.toggleArchive).toHaveBeenCalledWith('user-123', 't1');
    });
  });

  describe('toggleRecurringDate', () => {
    it('passes uid, id and date', async () => {
      mockService.toggleRecurringDate.mockResolvedValue({ id: 't1' });
      await controller.toggleRecurringDate(req, 't1', '2024-01-15');
      expect(service.toggleRecurringDate).toHaveBeenCalledWith('user-123', 't1', '2024-01-15');
    });
  });
});
