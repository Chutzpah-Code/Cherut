import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { FirebaseService } from '../../config/firebase.service';

describe('TasksService', () => {
  let service: TasksService;

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
  };

  const mockFirebaseService = { getFirestore: jest.fn(() => mockFirestore) };

  const USER = 'user-123';

  const mockTask = {
    id: 'task-1',
    userId: USER,
    title: 'Fix bug',
    status: 'todo',
    priority: 'medium',
    order: 0,
    archived: false,
  };

  const docOf = (id: string, data: object) => ({
    exists: true,
    id,
    data: () => data,
  });

  const snap = (items: { id: string; data: object }[]) => ({
    docs: items.map((d) => ({ id: d.id, data: () => d.data })),
  });

  // findOne always calls doc().get() and returns a task doc
  const taskDoc = (overrides: object = {}) =>
    docOf('task-1', { ...mockTask, ...overrides });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    jest.resetAllMocks();
    mockFirestore.collection.mockReturnThis();
    mockFirestore.where.mockReturnThis();
    mockFirestore.orderBy.mockReturnThis();
    mockFirestore.limit.mockReturnThis();
    mockFirestore.doc.mockReturnThis();
    mockFirebaseService.getFirestore.mockReturnValue(mockFirestore);
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates task with default status, priority and order', async () => {
      mockFirestore.add.mockResolvedValue({ id: 'task-1' });

      const result = await service.create(USER, { title: 'Fix bug' } as any) as any;

      const added = mockFirestore.add.mock.calls[0][0];
      expect(added.status).toBe('todo');
      expect(added.priority).toBe('medium');
      expect(added.order).toBe(0);
      expect(added.userId).toBe(USER);
      expect(result.id).toBe('task-1');
    });

    it('respects explicit status, priority and order', async () => {
      mockFirestore.add.mockResolvedValue({ id: 'task-2' });

      await service.create(USER, { title: 'Task', status: 'in_progress', priority: 'high', order: 5 } as any);

      const added = mockFirestore.add.mock.calls[0][0];
      expect(added.status).toBe('in_progress');
      expect(added.priority).toBe('high');
      expect(added.order).toBe(5);
    });
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all tasks for user', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([{ id: 'task-1', data: { userId: USER, title: 'T1', archived: false } }]),
      );

      const result = await service.findAll(USER) as any[];

      expect(result).toHaveLength(1);
    });

    it('filters archived tasks when archived=true', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([
          { id: 't1', data: { userId: USER, title: 'Active', archived: false } },
          { id: 't2', data: { userId: USER, title: 'Archived', archived: true } },
        ]),
      );

      const result = await service.findAll(USER, undefined, undefined, true) as any[];

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('t2');
    });

    it('applies lifeAreaId filter', async () => {
      mockFirestore.get.mockResolvedValue(snap([]));

      await service.findAll(USER, 'area-1');

      expect(mockFirestore.where).toHaveBeenCalledWith('lifeAreaId', '==', 'area-1');
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns task when found and owned', async () => {
      mockFirestore.get.mockResolvedValue(taskDoc());

      const result = await service.findOne(USER, 'task-1') as any;

      expect(result.id).toBe('task-1');
    });

    it('throws NotFoundException when not found', async () => {
      mockFirestore.get.mockResolvedValue({ exists: false });

      await expect(service.findOne(USER, 'ghost')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for wrong owner', async () => {
      mockFirestore.get.mockResolvedValue(taskDoc({ userId: 'other' }));

      await expect(service.findOne(USER, 'task-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates task and returns refreshed doc', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(taskDoc())
        .mockResolvedValueOnce(taskDoc({ title: 'Updated' }));
      mockFirestore.update.mockResolvedValue(undefined);

      const result = await service.update(USER, 'task-1', { title: 'Updated' } as any) as any;

      expect(mockFirestore.update).toHaveBeenCalled();
      expect(result.title).toBe('Updated');
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes task', async () => {
      mockFirestore.get.mockResolvedValue(taskDoc());
      mockFirestore.delete.mockResolvedValue(undefined);

      const result = await service.remove(USER, 'task-1');

      expect(mockFirestore.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Task deleted successfully' });
    });
  });

  // ─── getKanbanBoard ─────────────────────────────────────────────────────────

  describe('getKanbanBoard', () => {
    it('groups tasks by status', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([
          { id: 't1', data: { userId: USER, status: 'todo', archived: false } },
          { id: 't2', data: { userId: USER, status: 'in_progress', archived: false } },
          { id: 't3', data: { userId: USER, status: 'done', archived: false } },
        ]),
      );

      const result = await service.getKanbanBoard(USER) as any;

      expect(result.todo).toHaveLength(1);
      expect(result.in_progress).toHaveLength(1);
      expect(result.done).toHaveLength(1);
    });

    it('excludes archived tasks by default', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([
          { id: 't1', data: { userId: USER, status: 'todo', archived: false } },
          { id: 't2', data: { userId: USER, status: 'todo', archived: true } },
        ]),
      );

      const result = await service.getKanbanBoard(USER) as any;

      expect(result.todo).toHaveLength(1);
    });
  });

  // ─── Time Tracking ──────────────────────────────────────────────────────────

  describe('startTimeTracking', () => {
    it('adds a running entry to timeTracking', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(taskDoc({ timeTracking: [] }))
        .mockResolvedValueOnce(taskDoc({ timeTracking: [{ id: 'tr-1', status: 'running' }] }));
      mockFirestore.update.mockResolvedValue(undefined);

      await service.startTimeTracking(USER, 'task-1');

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({
          timeTracking: expect.arrayContaining([
            expect.objectContaining({ status: 'running' }),
          ]),
        }),
      );
    });

    it('throws BadRequestException if session already running', async () => {
      mockFirestore.get.mockResolvedValue(
        taskDoc({ timeTracking: [{ id: 'tr-1', status: 'running' }] }),
      );

      await expect(service.startTimeTracking(USER, 'task-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('pauseTimeTracking', () => {
    it('marks entry as paused and accumulates duration', async () => {
      const start = new Date(Date.now() - 60_000).toISOString(); // 60s ago
      const entry = { id: 'tr-1', startTime: start, status: 'running' };
      const paused = { ...entry, status: 'paused', duration: expect.any(Number) };

      mockFirestore.get
        .mockResolvedValueOnce(taskDoc({ timeTracking: [entry], totalTimeTracked: 0 }))
        .mockResolvedValueOnce(taskDoc({ timeTracking: [paused] }));
      mockFirestore.update.mockResolvedValue(undefined);

      await service.pauseTimeTracking(USER, 'task-1', 'tr-1');

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ totalTimeTracked: expect.any(Number) }),
      );
    });

    it('throws NotFoundException when tracking entry not found', async () => {
      mockFirestore.get.mockResolvedValue(taskDoc({ timeTracking: [] }));

      await expect(
        service.pauseTimeTracking(USER, 'task-1', 'no-such-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if entry is not running', async () => {
      mockFirestore.get.mockResolvedValue(
        taskDoc({ timeTracking: [{ id: 'tr-1', status: 'paused' }] }),
      );

      await expect(
        service.pauseTimeTracking(USER, 'task-1', 'tr-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addManualTimeEntry', () => {
    it('adds completed entry and updates totalTimeTracked', async () => {
      const start = '2024-01-15T10:00:00.000Z';
      const end = '2024-01-15T10:30:00.000Z'; // 1800s

      mockFirestore.get
        .mockResolvedValueOnce(taskDoc({ timeTracking: [], totalTimeTracked: 0 }))
        .mockResolvedValueOnce(taskDoc());
      mockFirestore.update.mockResolvedValue(undefined);

      await service.addManualTimeEntry(USER, 'task-1', { startTime: start, endTime: end });

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ totalTimeTracked: 1800 }),
      );
    });

    it('throws BadRequestException if end is before start', async () => {
      mockFirestore.get.mockResolvedValue(taskDoc({ timeTracking: [] }));

      await expect(
        service.addManualTimeEntry(USER, 'task-1', {
          startTime: '2024-01-15T10:30:00Z',
          endTime: '2024-01-15T10:00:00Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteTimeEntry', () => {
    it('removes entry and subtracts duration from totalTimeTracked', async () => {
      const entry = { id: 'tr-1', duration: 600, status: 'completed' };

      mockFirestore.get
        .mockResolvedValueOnce(taskDoc({ timeTracking: [entry], totalTimeTracked: 1000 }))
        .mockResolvedValueOnce(taskDoc());
      mockFirestore.update.mockResolvedValue(undefined);

      await service.deleteTimeEntry(USER, 'task-1', 'tr-1');

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ totalTimeTracked: 400 }),
      );
    });

    it('throws NotFoundException when entry not found', async () => {
      mockFirestore.get.mockResolvedValue(taskDoc({ timeTracking: [] }));

      await expect(service.deleteTimeEntry(USER, 'task-1', 'no-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── toggleChecklistItem ────────────────────────────────────────────────────

  describe('toggleChecklistItem', () => {
    it('toggles checked item to unchecked', async () => {
      const checklist = [
        { id: 'ci-1', text: 'Step 1', completed: true },
        { id: 'ci-2', text: 'Step 2', completed: false },
      ];

      mockFirestore.get
        .mockResolvedValueOnce(taskDoc({ checklist }))
        .mockResolvedValueOnce(taskDoc());
      mockFirestore.update.mockResolvedValue(undefined);

      await service.toggleChecklistItem(USER, 'task-1', 'ci-1');

      const updated = mockFirestore.update.mock.calls[0][0].checklist;
      expect(updated.find((i: any) => i.id === 'ci-1').completed).toBe(false);
    });
  });

  // ─── toggleArchive ───────────────────────────────────────────────────────────

  describe('toggleArchive', () => {
    it('archives a non-archived task', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(taskDoc({ archived: false }))
        .mockResolvedValueOnce(taskDoc({ archived: true }));
      mockFirestore.update.mockResolvedValue(undefined);

      const result = await service.toggleArchive(USER, 'task-1') as any;

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ archived: true }),
      );
      expect(result.archived).toBe(true);
    });
  });

  // ─── getTaskCounts ───────────────────────────────────────────────────────────

  describe('getTaskCounts', () => {
    it('counts active, archived and total', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([
          { id: 't1', data: { userId: USER, archived: false } },
          { id: 't2', data: { userId: USER, archived: false } },
          { id: 't3', data: { userId: USER, archived: true } },
        ]),
      );

      const result = await service.getTaskCounts(USER) as any;

      expect(result).toEqual({ active: 2, archived: 1, total: 3 });
    });
  });
});
