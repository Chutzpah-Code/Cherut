import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { FirebaseService } from '../../config/firebase.service';

describe('BoardsService', () => {
  let service: BoardsService;

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
  };

  const mockFirebaseService = { getFirestore: jest.fn(() => mockFirestore) };

  const USER = 'user-123';
  const BOARD_ID = 'board-1';
  const COL_ID = 'col-1';

  const boardData = { userId: USER, name: 'My Board', colorIndex: 0 };
  const colData = { userId: USER, boardId: BOARD_ID, name: 'To Do', order: 0 };

  const docOf = (id: string, data: object) => ({
    exists: true, id, data: () => data, ref: { id },
  });

  const snap = (items: { id: string; data: object }[]) => ({
    docs: items.map((d) => ({ id: d.id, data: () => d.data, ref: { id: d.id } })),
    empty: items.length === 0,
    size: items.length,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);

    jest.resetAllMocks();
    mockFirestore.collection.mockReturnThis();
    mockFirestore.where.mockReturnThis();
    mockFirestore.limit.mockReturnThis();
    mockFirestore.doc.mockReturnThis();
    mockFirestore.batch.mockReturnValue(mockBatch);
    mockBatch.commit.mockResolvedValue(undefined);
    mockFirebaseService.getFirestore.mockReturnValue(mockFirestore);
  });

  // ─── createBoard ─────────────────────────────────────────────────────────────

  describe('createBoard', () => {
    it('creates board with userId, name and colorIndex', async () => {
      mockFirestore.add.mockResolvedValue({ id: BOARD_ID });

      const result = await service.createBoard(USER, { name: 'My Board', colorIndex: 2 }) as any;

      const added = mockFirestore.add.mock.calls[0][0];
      expect(added.userId).toBe(USER);
      expect(added.name).toBe('My Board');
      expect(added.colorIndex).toBe(2);
      expect(result.id).toBe(BOARD_ID);
    });

    it('defaults colorIndex to 0 when omitted', async () => {
      mockFirestore.add.mockResolvedValue({ id: BOARD_ID });

      await service.createBoard(USER, { name: 'Board' });

      expect(mockFirestore.add.mock.calls[0][0].colorIndex).toBe(0);
    });
  });

  // ─── createDefaultBoard ──────────────────────────────────────────────────────

  describe('createDefaultBoard', () => {
    it('returns existing board without creating a new one', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([{ id: BOARD_ID, data: boardData }]),
      );

      const result = await service.createDefaultBoard(USER) as any;

      expect(mockFirestore.add).not.toHaveBeenCalled();
      expect(result.id).toBe(BOARD_ID);
    });

    it('creates board with default columns when none exist', async () => {
      // First get (existing boards check) → empty
      // Subsequent gets (findOneBoard + createColumn calls) → board doc
      mockFirestore.get
        .mockResolvedValueOnce(snap([]))                          // no existing boards
        .mockResolvedValue(docOf(BOARD_ID, boardData));           // findOneBoard + column size checks
      mockFirestore.add
        .mockResolvedValueOnce({ id: BOARD_ID })                 // createBoard
        .mockResolvedValue({ id: COL_ID });                       // 3× createColumn

      await service.createDefaultBoard(USER);

      // add called 4 times: 1 board + 3 columns
      expect(mockFirestore.add).toHaveBeenCalledTimes(4);
    });
  });

  // ─── findAllBoards ───────────────────────────────────────────────────────────

  describe('findAllBoards', () => {
    it('returns boards sorted by createdAt ascending', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([
          { id: 'b2', data: { ...boardData, createdAt: '2024-02-01' } },
          { id: 'b1', data: { ...boardData, createdAt: '2024-01-01' } },
        ]),
      );

      const result = await service.findAllBoards(USER) as any[];

      expect(result[0].id).toBe('b1');
      expect(result[1].id).toBe('b2');
    });
  });

  // ─── findOneBoard ────────────────────────────────────────────────────────────

  describe('findOneBoard', () => {
    it('returns board when found and owned', async () => {
      mockFirestore.get.mockResolvedValue(docOf(BOARD_ID, boardData));

      const result = await service.findOneBoard(USER, BOARD_ID) as any;

      expect(result.id).toBe(BOARD_ID);
    });

    it('throws NotFoundException when not found', async () => {
      mockFirestore.get.mockResolvedValue({ exists: false });

      await expect(service.findOneBoard(USER, 'ghost')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for wrong owner', async () => {
      mockFirestore.get.mockResolvedValue(docOf(BOARD_ID, { ...boardData, userId: 'other' }));

      await expect(service.findOneBoard(USER, BOARD_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── updateBoard ─────────────────────────────────────────────────────────────

  describe('updateBoard', () => {
    it('updates board and returns refreshed doc', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(BOARD_ID, boardData))
        .mockResolvedValueOnce(docOf(BOARD_ID, { ...boardData, name: 'Renamed' }));
      mockFirestore.update.mockResolvedValue(undefined);

      const result = await service.updateBoard(USER, BOARD_ID, { name: 'Renamed' }) as any;

      expect(mockFirestore.update).toHaveBeenCalled();
      expect(result.name).toBe('Renamed');
    });
  });

  // ─── deleteBoard ─────────────────────────────────────────────────────────────

  describe('deleteBoard', () => {
    it('deletes board and all its columns in batch', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(BOARD_ID, boardData))      // findOneBoard
        .mockResolvedValueOnce(snap([{ id: COL_ID, data: colData }])); // columns

      await service.deleteBoard(USER, BOARD_ID);

      expect(mockBatch.delete).toHaveBeenCalledTimes(2); // 1 col + 1 board
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  // ─── createColumn ────────────────────────────────────────────────────────────

  describe('createColumn', () => {
    it('creates column with boardId, name and order', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(BOARD_ID, boardData))    // findOneBoard
        .mockResolvedValueOnce(snap([]));                      // existingCols (size=0)
      mockFirestore.add.mockResolvedValue({ id: COL_ID });

      const result = await service.createColumn(USER, BOARD_ID, { name: 'Backlog', order: 0 }) as any;

      const added = mockFirestore.add.mock.calls[0][0];
      expect(added.boardId).toBe(BOARD_ID);
      expect(added.name).toBe('Backlog');
      expect(result.id).toBe(COL_ID);
    });

    it('uses existing column count as order when order is omitted', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(BOARD_ID, boardData))
        .mockResolvedValueOnce(snap([
          { id: 'c1', data: {} }, { id: 'c2', data: {} },
        ])); // size = 2
      mockFirestore.add.mockResolvedValue({ id: COL_ID });

      await service.createColumn(USER, BOARD_ID, { name: 'New' });

      expect(mockFirestore.add.mock.calls[0][0].order).toBe(2);
    });
  });

  // ─── updateColumn ────────────────────────────────────────────────────────────

  describe('updateColumn', () => {
    it('updates column fields and returns merged doc', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(BOARD_ID, boardData))          // findOneBoard
        .mockResolvedValueOnce(docOf(COL_ID, colData));              // column doc
      mockFirestore.update.mockResolvedValue(undefined);

      const result = await service.updateColumn(USER, BOARD_ID, COL_ID, { name: 'Done' }) as any;

      expect(mockFirestore.update).toHaveBeenCalled();
      expect(result.name).toBe('Done');
    });

    it('throws NotFoundException when column belongs to different board', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(BOARD_ID, boardData))
        .mockResolvedValueOnce(docOf(COL_ID, { ...colData, boardId: 'other-board' }));

      await expect(
        service.updateColumn(USER, BOARD_ID, COL_ID, { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── deleteColumn ────────────────────────────────────────────────────────────

  describe('deleteColumn', () => {
    it('deletes column after verifying board ownership', async () => {
      mockFirestore.get.mockResolvedValue(docOf(BOARD_ID, boardData));
      mockFirestore.delete.mockResolvedValue(undefined);

      await service.deleteColumn(USER, BOARD_ID, COL_ID);

      expect(mockFirestore.delete).toHaveBeenCalled();
    });
  });

  // ─── getKanban ───────────────────────────────────────────────────────────────

  describe('getKanban', () => {
    it('groups tasks into their columns, sorted by order', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(BOARD_ID, boardData))  // findOneBoard
        .mockResolvedValueOnce(                              // parallel: columns
          snap([
            { id: 'c1', data: { boardId: BOARD_ID, name: 'To Do', order: 0 } },
            { id: 'c2', data: { boardId: BOARD_ID, name: 'Done', order: 1 } },
          ]),
        )
        .mockResolvedValueOnce(                              // parallel: tasks
          snap([
            { id: 't1', data: { userId: USER, boardId: BOARD_ID, columnId: 'c1', order: 0, archived: false } },
            { id: 't2', data: { userId: USER, boardId: BOARD_ID, columnId: 'c2', order: 0, archived: false } },
          ]),
        );

      const result = await service.getKanban(USER, BOARD_ID) as any[];

      expect(result).toHaveLength(2);
      expect(result[0].tasks).toHaveLength(1);
      expect(result[0].tasks[0].id).toBe('t1');
      expect(result[1].tasks[0].id).toBe('t2');
    });

    it('excludes archived tasks from columns', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(BOARD_ID, boardData))
        .mockResolvedValueOnce(snap([{ id: 'c1', data: { boardId: BOARD_ID, name: 'To Do', order: 0 } }]))
        .mockResolvedValueOnce(snap([
          { id: 't1', data: { userId: USER, boardId: BOARD_ID, columnId: 'c1', order: 0, archived: false } },
          { id: 't2', data: { userId: USER, boardId: BOARD_ID, columnId: 'c1', order: 1, archived: true } },
        ]));

      const result = await service.getKanban(USER, BOARD_ID) as any[];

      expect(result[0].tasks).toHaveLength(1);
      expect(result[0].tasks[0].id).toBe('t1');
    });
  });
});
