import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

export type BoardRole = 'owner' | 'editor' | 'collaborator';
export type BoardMemberStatus = 'pending' | 'accepted';

export interface BoardMember {
  email: string;
  uid: string;
  role: BoardRole;
  status: BoardMemberStatus;
  invitedAt: string;
  invitedByUid: string;
  invitedByEmail: string;
}

@Injectable()
export class BoardsService {
  private readonly logger = new Logger(BoardsService.name);
  private readonly boardsCollection = 'boards';
  private readonly columnsCollection = 'columns';
  private readonly tasksCollection = 'tasks';
  private readonly usersCollection = 'users';

  constructor(private readonly firebaseService: FirebaseService) {}

  // ─── Access helpers ──────────────────────────────────────────────────────

  // The caller's role on a board they're already known to have access to
  // (i.e. call this after findOneBoard, not instead of it).
  private getRole(board: any, uid: string): BoardRole | undefined {
    if (board.userId === uid) return 'owner';
    return (board.members as BoardMember[] | undefined)?.find((m) => m.uid === uid)?.role;
  }

  private async resolveEmailToUid(email: string): Promise<string | undefined> {
    const db = this.firebaseService.getFirestore();
    const snap = await db
      .collection(this.usersCollection)
      .where('email', '==', email)
      .limit(1)
      .get();
    return snap.empty ? undefined : snap.docs[0].id;
  }

  // ─── Boards ────────────────────────────────────────────────────────────────

  async createBoard(userId: string, email: string | null, dto: CreateBoardDto) {
    const db = this.firebaseService.getFirestore();
    const now = new Date().toISOString();

    const ownerEmail = (email ?? '').toLowerCase();
    const ownerMember: BoardMember = {
      email: ownerEmail,
      uid: userId,
      role: 'owner',
      status: 'accepted',
      invitedAt: now,
      invitedByUid: userId,
      invitedByEmail: ownerEmail,
    };

    const board = {
      userId,
      name: dto.name,
      colorIndex: dto.colorIndex ?? 0,
      members: [ownerMember],
      memberUids: [userId],
      pendingInviteUids: [] as string[],
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(this.boardsCollection).add(board);
    this.logger.log(`Board created: ${ref.id} for user ${userId}`);

    return { id: ref.id, ...board };
  }

  async createDefaultBoard(userId: string, email: string | null) {
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

    const board = await this.createBoard(userId, email, { name: 'Board', colorIndex: 0 });

    await Promise.all([
      this.createColumn(userId, board.id, { name: 'To Do', order: 0 }),
      this.createColumn(userId, board.id, { name: 'In Progress', order: 1 }),
      this.createColumn(userId, board.id, { name: 'Done', order: 2 }),
    ]);

    return board;
  }

  async findAllBoards(userId: string) {
    const db = this.firebaseService.getFirestore();

    // Boards the user owns, plus boards they were invited into as a member.
    // Two separate equality queries merged in memory — same pattern already
    // used in FinanceService for transactions that reference an account on
    // either side of a transfer.
    const [ownedSnap, memberSnap] = await Promise.all([
      db.collection(this.boardsCollection).where('userId', '==', userId).get(),
      db.collection(this.boardsCollection).where('memberUids', 'array-contains', userId).get(),
    ]);

    const byId = new Map<string, any>();
    ownedSnap.docs.forEach((doc) => byId.set(doc.id, { id: doc.id, ...doc.data() }));
    memberSnap.docs.forEach((doc) => byId.set(doc.id, { id: doc.id, ...doc.data() }));

    return Array.from(byId.values()).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  }

  async findOneBoard(userId: string, boardId: string): Promise<any> {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.boardsCollection).doc(boardId).get();

    if (!doc.exists) {
      throw new NotFoundException('Board not found');
    }

    const data = doc.data();
    const isMember = !!data && (data.userId === userId || (data.memberUids ?? []).includes(userId));

    if (!isMember) {
      throw new NotFoundException('Board not found');
    }

    return { id: doc.id, ...data };
  }

  async updateBoard(userId: string, boardId: string, dto: UpdateBoardDto) {
    await this.findOneBoard(userId, boardId);

    const db = this.firebaseService.getFirestore();
    const updates = { ...dto, updatedAt: new Date().toISOString() };

    await db.collection(this.boardsCollection).doc(boardId).update(updates);
    return this.findOneBoard(userId, boardId);
  }

  async deleteBoard(userId: string, boardId: string) {
    const board = await this.findOneBoard(userId, boardId);
    if (board.userId !== userId) {
      throw new ForbiddenException('Only the board owner can delete it');
    }

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

  // ─── Members ───────────────────────────────────────────────────────────────

  async addMember(
    userId: string,
    boardId: string,
    callerEmail: string | null,
    email: string,
    role: 'editor' | 'collaborator',
  ) {
    const board = await this.findOneBoard(userId, boardId);
    const callerRole = this.getRole(board, userId);
    if (callerRole !== 'owner' && callerRole !== 'editor') {
      throw new ForbiddenException('Only owners and editors can add members');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const members: BoardMember[] = board.members ?? [];

    if (members.some((m) => m.email === normalizedEmail)) {
      throw new BadRequestException('This person is already a member of this board');
    }

    const resolvedUid = await this.resolveEmailToUid(normalizedEmail);
    if (!resolvedUid) {
      throw new NotFoundException('No Cherut account found for this email');
    }

    // The invite is pending until the invitee accepts it — their uid is
    // tracked separately in pendingInviteUids (used to look up "invitations
    // sent to me") and deliberately kept OUT of memberUids (which is what
    // every access check — findOneBoard, getKanban, etc. — reads), so they
    // have no board access at all until they accept.
    const newMember: BoardMember = {
      email: normalizedEmail,
      uid: resolvedUid,
      role,
      status: 'pending',
      invitedAt: new Date().toISOString(),
      invitedByUid: userId,
      invitedByEmail: (callerEmail ?? '').toLowerCase(),
    };

    const updatedMembers = [...members, newMember];
    const db = this.firebaseService.getFirestore();
    await db.collection(this.boardsCollection).doc(boardId).update({
      members: updatedMembers,
      pendingInviteUids: [...(board.pendingInviteUids ?? []), resolvedUid],
      updatedAt: new Date().toISOString(),
    });

    return this.findOneBoard(userId, boardId);
  }

  async removeMember(userId: string, boardId: string, email: string) {
    const board = await this.findOneBoard(userId, boardId);
    if (board.userId !== userId) {
      throw new ForbiddenException('Only the board owner can remove members');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const members: BoardMember[] = board.members ?? [];
    const target = members.find((m) => m.email === normalizedEmail);

    if (!target) {
      throw new NotFoundException('Member not found');
    }
    if (target.uid === board.userId) {
      throw new BadRequestException('The board owner cannot be removed');
    }

    // Covers both cases with the same action: removing an already-accepted
    // member, and cancelling a still-pending invite — the target's uid is
    // just cleared from whichever of the two denormalized arrays it's in.
    const updatedMembers = members.filter((m) => m.email !== normalizedEmail);
    const db = this.firebaseService.getFirestore();
    await db.collection(this.boardsCollection).doc(boardId).update({
      members: updatedMembers,
      memberUids: (board.memberUids ?? []).filter((uid: string) => uid !== target.uid),
      pendingInviteUids: (board.pendingInviteUids ?? []).filter((uid: string) => uid !== target.uid),
      updatedAt: new Date().toISOString(),
    });

    return this.findOneBoard(userId, boardId);
  }

  async updateMemberRole(userId: string, boardId: string, targetUid: string, role: 'editor' | 'collaborator') {
    const board = await this.findOneBoard(userId, boardId);
    if (board.userId !== userId) {
      throw new ForbiddenException('Only the board owner can change member roles');
    }
    if (targetUid === board.userId) {
      throw new BadRequestException("The owner's role can only change via ownership transfer");
    }

    const members: BoardMember[] = board.members ?? [];
    const target = members.find((m) => m.uid === targetUid);
    if (!target) {
      throw new NotFoundException('Member not found');
    }
    if (target.status === 'pending') {
      throw new BadRequestException('Cannot change the role of a pending invitation');
    }

    const updatedMembers = members.map((m) => (m.uid === targetUid ? { ...m, role } : m));
    const db = this.firebaseService.getFirestore();
    await db.collection(this.boardsCollection).doc(boardId).update({
      members: updatedMembers,
      updatedAt: new Date().toISOString(),
    });

    return this.findOneBoard(userId, boardId);
  }

  async transferOwnership(userId: string, boardId: string, newOwnerUid: string) {
    const board = await this.findOneBoard(userId, boardId);
    if (board.userId !== userId) {
      throw new ForbiddenException('Only the board owner can transfer ownership');
    }

    const members: BoardMember[] = board.members ?? [];
    const target = members.find((m) => m.uid === newOwnerUid);
    if (!target) {
      throw new BadRequestException('The new owner must already be a member of this board');
    }
    if (target.status === 'pending') {
      throw new BadRequestException('Cannot transfer ownership to a pending invitation');
    }
    if (newOwnerUid === board.userId) {
      throw new BadRequestException('This member is already the owner');
    }

    const updatedMembers = members.map((m) => {
      if (m.uid === newOwnerUid) return { ...m, role: 'owner' as const };
      if (m.uid === board.userId) return { ...m, role: 'editor' as const };
      return m;
    });

    const db = this.firebaseService.getFirestore();
    await db.collection(this.boardsCollection).doc(boardId).update({
      userId: newOwnerUid,
      members: updatedMembers,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Board ${boardId} ownership transferred from ${userId} to ${newOwnerUid}`);
    return this.findOneBoard(newOwnerUid, boardId);
  }

  // ─── Invitations ───────────────────────────────────────────────────────────

  async findPendingInvitations(userId: string) {
    const db = this.firebaseService.getFirestore();
    const snap = await db
      .collection(this.boardsCollection)
      .where('pendingInviteUids', 'array-contains', userId)
      .get();

    return snap.docs
      .map((doc) => {
        const data: any = doc.data();
        const member: BoardMember | undefined = (data.members ?? []).find(
          (m: BoardMember) => m.uid === userId,
        );
        if (!member) return null;
        return {
          boardId: doc.id,
          boardName: data.name,
          colorIndex: data.colorIndex,
          role: member.role,
          invitedByEmail: member.invitedByEmail,
          invitedAt: member.invitedAt,
        };
      })
      .filter((invitation): invitation is NonNullable<typeof invitation> => invitation !== null);
  }

  // Pending invitees aren't in memberUids yet, so findOneBoard (which gates
  // on memberUids) would 404 them — accept/decline need their own direct
  // lookup that instead checks pendingInviteUids.
  private async loadBoardForInvitee(userId: string, boardId: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.boardsCollection).doc(boardId).get();

    if (!doc.exists) {
      throw new NotFoundException('Invitation not found');
    }

    const data: any = doc.data();
    if (!(data.pendingInviteUids ?? []).includes(userId)) {
      throw new NotFoundException('Invitation not found');
    }

    return { id: doc.id, ...data };
  }

  async acceptInvitation(userId: string, boardId: string) {
    const board = await this.loadBoardForInvitee(userId, boardId);
    const members: BoardMember[] = board.members ?? [];

    const updatedMembers = members.map((m) =>
      m.uid === userId ? { ...m, status: 'accepted' as const } : m,
    );

    const db = this.firebaseService.getFirestore();
    await db.collection(this.boardsCollection).doc(boardId).update({
      members: updatedMembers,
      memberUids: [...(board.memberUids ?? []), userId],
      pendingInviteUids: (board.pendingInviteUids ?? []).filter((uid: string) => uid !== userId),
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Invitation accepted: board ${boardId} by ${userId}`);
  }

  async declineInvitation(userId: string, boardId: string) {
    const board = await this.loadBoardForInvitee(userId, boardId);
    const members: BoardMember[] = board.members ?? [];

    const updatedMembers = members.filter((m) => m.uid !== userId);

    const db = this.firebaseService.getFirestore();
    await db.collection(this.boardsCollection).doc(boardId).update({
      members: updatedMembers,
      pendingInviteUids: (board.pendingInviteUids ?? []).filter((uid: string) => uid !== userId),
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Invitation declined: board ${boardId} by ${userId}`);
  }

  // ─── Columns ───────────────────────────────────────────────────────────────

  async createColumn(userId: string, boardId: string, dto: CreateColumnDto) {
    const board = await this.findOneBoard(userId, boardId);

    const db = this.firebaseService.getFirestore();
    const now = new Date().toISOString();

    const existingCols = await db
      .collection(this.columnsCollection)
      .where('boardId', '==', boardId)
      .get();

    // Columns/tasks within a shared board are always stamped with the
    // board OWNER's uid, never the caller's — every existing query that
    // filters tasks/columns by `userId` (deleteColumn's cascade, getKanban,
    // TasksService's own queries) assumes that uid identifies "which
    // board's data this belongs to", not "who personally created it". An
    // editor/collaborator creating a column under their own uid would make
    // it invisible to those queries.
    const column = {
      userId: board.userId,
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
      .get();

    return snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as any))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
    const board = await this.findOneBoard(userId, boardId);

    const db = this.firebaseService.getFirestore();
    const batch = db.batch();

    // Cascade-delete every active task in this column — tasks reference
    // columnId but aren't cleaned up automatically by Firestore. Archived
    // tasks are deliberately spared: they're kept with their now-dangling
    // columnId, and the frontend (BoardKanbanView's restore flow) re-homes
    // them into another (or a newly created) column when the user later
    // restores them, after confirming with a dialog since it's not what
    // they'll expect.
    //
    // Filtered by the board OWNER's uid (not the caller's) — see the note
    // in createColumn on why every task/column in a shared board is
    // stamped with the owner's uid regardless of who created it.
    const taskSnap = await db
      .collection(this.tasksCollection)
      .where('userId', '==', board.userId)
      .where('columnId', '==', columnId)
      .where('archived', '==', false)
      .get();
    taskSnap.docs.forEach((doc) => batch.delete(doc.ref));

    batch.delete(db.collection(this.columnsCollection).doc(columnId));

    await batch.commit();
    this.logger.log(
      `Column ${columnId} and ${taskSnap.size} task(s) deleted from board ${boardId}`,
    );
  }

  // ─── Kanban view ───────────────────────────────────────────────────────────

  async getKanban(userId: string, boardId: string) {
    const board = await this.findOneBoard(userId, boardId);

    const db = this.firebaseService.getFirestore();

    const [colSnap, taskSnap] = await Promise.all([
      db
        .collection(this.columnsCollection)
        .where('boardId', '==', boardId)
        .get(),
      db
        .collection(this.tasksCollection)
        .where('userId', '==', board.userId)
        .where('boardId', '==', boardId)
        .get(),
    ]);

    const columns = colSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data(), tasks: [] as any[] } as any))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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
