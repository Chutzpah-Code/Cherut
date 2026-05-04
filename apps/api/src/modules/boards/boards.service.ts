import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class BoardsService {
  private readonly logger = new Logger(BoardsService.name);
  private readonly boardsCollection = 'boards';
  private readonly columnsCollection = 'columns';
  private readonly tasksCollection = 'tasks';

  constructor(private readonly firebaseService: FirebaseService) {}

  // ─── Boards ────────────────────────────────────────────────────────────────

  async createBoard(userId: string, dto: CreateBoardDto) {
    const db = this.firebaseService.getFirestore();
    const now = new Date().toISOString();

    const board = {
      userId,
      name: dto.name,
      colorIndex: dto.colorIndex ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(this.boardsCollection).add(board);
    this.logger.log(`Board created: ${ref.id} for user ${userId}`);

    return { id: ref.id, ...board };
  }

  async createDefaultBoard(userId: string) {
    const db = this.firebaseService.getFirestore();

    const existing = await db
      .collection(this.boardsCollection)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!existing.empty) {
      const doc = existing.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    const board = await this.createBoard(userId, { name: 'Board', colorIndex: 0 });

    await Promise.all([
      this.createColumn(userId, board.id, { name: 'To Do', order: 0 }),
      this.createColumn(userId, board.id, { name: 'In Progress', order: 1 }),
      this.createColumn(userId, board.id, { name: 'Done', order: 2 }),
    ]);

    return board;
  }

  async findAllBoards(userId: string) {
    const db = this.firebaseService.getFirestore();

    const snap = await db
      .collection(this.boardsCollection)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'asc')
      .get();

    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOneBoard(userId: string, boardId: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.boardsCollection).doc(boardId).get();

    if (!doc.exists || doc.data()?.userId !== userId) {
      throw new NotFoundException('Board not found');
    }

    return { id: doc.id, ...doc.data() };
  }

  async updateBoard(userId: string, boardId: string, dto: UpdateBoardDto) {
    await this.findOneBoard(userId, boardId);

    const db = this.firebaseService.getFirestore();
    const updates = { ...dto, updatedAt: new Date().toISOString() };

    await db.collection(this.boardsCollection).doc(boardId).update(updates);
    return this.findOneBoard(userId, boardId);
  }

  async deleteBoard(userId: string, boardId: string) {
    await this.findOneBoard(userId, boardId);

    const db = this.firebaseService.getFirestore();
    const batch = db.batch();

    // Delete all columns
    const colSnap = await db
      .collection(this.columnsCollection)
      .where('boardId', '==', boardId)
      .get();
    colSnap.docs.forEach((doc) => batch.delete(doc.ref));

    // Delete the board
    batch.delete(db.collection(this.boardsCollection).doc(boardId));

    await batch.commit();
    this.logger.log(`Board ${boardId} and its columns deleted`);
  }

  // ─── Columns ───────────────────────────────────────────────────────────────

  async createColumn(userId: string, boardId: string, dto: CreateColumnDto) {
    await this.findOneBoard(userId, boardId);

    const db = this.firebaseService.getFirestore();
    const now = new Date().toISOString();

    const existingCols = await db
      .collection(this.columnsCollection)
      .where('boardId', '==', boardId)
      .get();

    const column = {
      userId,
      boardId,
      name: dto.name,
      order: dto.order ?? existingCols.size,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(this.columnsCollection).add(column);
    return { id: ref.id, ...column };
  }

  async findAllColumns(userId: string, boardId: string) {
    await this.findOneBoard(userId, boardId);

    const db = this.firebaseService.getFirestore();
    const snap = await db
      .collection(this.columnsCollection)
      .where('boardId', '==', boardId)
      .orderBy('order', 'asc')
      .get();

    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async updateColumn(
    userId: string,
    boardId: string,
    columnId: string,
    dto: UpdateColumnDto,
  ) {
    await this.findOneBoard(userId, boardId);

    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.columnsCollection).doc(columnId).get();

    if (!doc.exists || doc.data()?.boardId !== boardId) {
      throw new NotFoundException('Column not found');
    }

    const updates = { ...dto, updatedAt: new Date().toISOString() };
    await db.collection(this.columnsCollection).doc(columnId).update(updates);

    return { id: columnId, ...doc.data(), ...updates };
  }

  async deleteColumn(userId: string, boardId: string, columnId: string) {
    await this.findOneBoard(userId, boardId);

    const db = this.firebaseService.getFirestore();
    await db.collection(this.columnsCollection).doc(columnId).delete();
    this.logger.log(`Column ${columnId} deleted from board ${boardId}`);
  }

  // ─── Kanban view ───────────────────────────────────────────────────────────

  async getKanban(userId: string, boardId: string) {
    await this.findOneBoard(userId, boardId);

    const db = this.firebaseService.getFirestore();

    const [colSnap, taskSnap] = await Promise.all([
      db
        .collection(this.columnsCollection)
        .where('boardId', '==', boardId)
        .orderBy('order', 'asc')
        .get(),
      db
        .collection(this.tasksCollection)
        .where('userId', '==', userId)
        .where('boardId', '==', boardId)
        .get(),
    ]);

    const columns = colSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      tasks: [] as any[],
    }));

    const tasksByColumn: Record<string, any[]> = {};
    taskSnap.docs.forEach((doc) => {
      const task = { id: doc.id, ...doc.data() } as any;
      if (task.archived) return; // skip archived tasks in memory
      const colId = task.columnId;
      if (!tasksByColumn[colId]) tasksByColumn[colId] = [];
      tasksByColumn[colId].push(task);
    });

    columns.forEach((col) => {
      col.tasks = (tasksByColumn[col.id] || []).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
    });

    return columns;
  }
}
