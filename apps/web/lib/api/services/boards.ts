import { apiClient } from '../client';
import { Task } from './tasks';

export type BoardRole = 'owner' | 'editor' | 'collaborator';

export interface BoardMember {
  email: string;
  uid: string;
  role: BoardRole;
  invitedAt: string;
  invitedByUid: string;
}

export interface Board {
  id: string;
  userId: string;
  name: string;
  colorIndex: number;
  members: BoardMember[];
  memberUids: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  userId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn extends Column {
  tasks: Task[];
}

export interface CreateBoardDto {
  name: string;
  colorIndex?: number;
}

export interface UpdateBoardDto {
  name?: string;
  colorIndex?: number;
}

export interface CreateColumnDto {
  name: string;
  order?: number;
}

export interface UpdateColumnDto {
  name?: string;
  order?: number;
}

export const boardsApi = {
  // Boards
  ensureDefault: async (): Promise<Board> => {
    const { data } = await apiClient.post('/boards/default');
    return data;
  },

  getAll: async (): Promise<Board[]> => {
    const { data } = await apiClient.get('/boards');
    return data;
  },

  getOne: async (boardId: string): Promise<Board> => {
    const { data } = await apiClient.get(`/boards/${boardId}`);
    return data;
  },

  create: async (dto: CreateBoardDto): Promise<Board> => {
    const { data } = await apiClient.post('/boards', dto);
    return data;
  },

  update: async (boardId: string, dto: UpdateBoardDto): Promise<Board> => {
    const { data } = await apiClient.patch(`/boards/${boardId}`, dto);
    return data;
  },

  delete: async (boardId: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}`);
  },

  // Columns
  getColumns: async (boardId: string): Promise<Column[]> => {
    const { data } = await apiClient.get(`/boards/${boardId}/columns`);
    return data;
  },

  createColumn: async (boardId: string, dto: CreateColumnDto): Promise<Column> => {
    const { data } = await apiClient.post(`/boards/${boardId}/columns`, dto);
    return data;
  },

  updateColumn: async (
    boardId: string,
    columnId: string,
    dto: UpdateColumnDto,
  ): Promise<Column> => {
    const { data } = await apiClient.patch(
      `/boards/${boardId}/columns/${columnId}`,
      dto,
    );
    return data;
  },

  deleteColumn: async (boardId: string, columnId: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}/columns/${columnId}`);
  },

  // Members
  addMember: async (
    boardId: string,
    email: string,
    role: 'editor' | 'collaborator',
  ): Promise<Board> => {
    const { data } = await apiClient.post(`/boards/${boardId}/members`, { email, role });
    return data;
  },

  removeMember: async (boardId: string, email: string): Promise<Board> => {
    const { data } = await apiClient.delete(
      `/boards/${boardId}/members/${encodeURIComponent(email)}`,
    );
    return data;
  },

  updateMemberRole: async (
    boardId: string,
    uid: string,
    role: 'editor' | 'collaborator',
  ): Promise<Board> => {
    const { data } = await apiClient.patch(`/boards/${boardId}/members/${uid}`, { role });
    return data;
  },

  transferOwnership: async (boardId: string, newOwnerUid: string): Promise<Board> => {
    const { data } = await apiClient.post(`/boards/${boardId}/transfer-ownership`, {
      newOwnerUid,
    });
    return data;
  },

  // Kanban view
  getKanban: async (boardId: string): Promise<KanbanColumn[]> => {
    const { data } = await apiClient.get(`/boards/${boardId}/kanban`);
    return data;
  },
};
