import { apiClient } from '../client';

export interface KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  isArchived?: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Objective {
  id: string;
  userId: string;
  lifeAreaId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  isActive: boolean;
  isArchived?: boolean;
  keyResults?: KeyResult[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateKeyResultDto {
  title: string;
  description?: string;
  dueDate: string;
}

export interface CreateObjectiveDto {
  lifeAreaId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  keyResults?: CreateKeyResultDto[];
}

export interface UpdateKeyResultDto {
  title?: string;
  description?: string;
  dueDate?: string;
  isCompleted?: boolean;
}

export interface UpdateObjectiveDto {
  lifeAreaId?: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'completed' | 'cancelled';
  progress?: number;
}

export const objectivesApi = {
  getAll: async (lifeAreaId?: string): Promise<Objective[]> => {
    const params = lifeAreaId ? { lifeAreaId } : {};
    const { data } = await apiClient.get('/objectives', { params });
    return data;
  },

  getOne: async (id: string): Promise<Objective> => {
    const { data } = await apiClient.get(`/objectives/${id}`);
    return data;
  },

  create: async (dto: CreateObjectiveDto): Promise<Objective> => {
    const { data } = await apiClient.post('/objectives', dto);
    return data;
  },

  update: async (id: string, dto: UpdateObjectiveDto): Promise<Objective> => {
    const { data } = await apiClient.patch(`/objectives/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/objectives/${id}`);
  },

  // Key Results operations
  createKeyResult: async (objectiveId: string, dto: CreateKeyResultDto): Promise<KeyResult> => {
    const { data } = await apiClient.post(`/objectives/${objectiveId}/key-results`, dto);
    return data;
  },

  updateKeyResult: async (objectiveId: string, keyResultId: string, dto: UpdateKeyResultDto): Promise<KeyResult> => {
    const { data } = await apiClient.patch(`/objectives/${objectiveId}/key-results/${keyResultId}`, dto);
    return data;
  },

  deleteKeyResult: async (objectiveId: string, keyResultId: string): Promise<void> => {
    await apiClient.delete(`/objectives/${objectiveId}/key-results/${keyResultId}`);
  },

  completeKeyResult: async (objectiveId: string, keyResultId: string): Promise<KeyResult> => {
    const { data } = await apiClient.patch(`/objectives/${objectiveId}/key-results/${keyResultId}`, {
      isCompleted: true,
      completedAt: new Date().toISOString(),
    });
    return data;
  },

  completeObjective: async (id: string): Promise<Objective> => {
    const { data } = await apiClient.patch(`/objectives/${id}`, {
      status: 'completed',
    });
    return data;
  },

  // Toggle completion operations
  toggleObjectiveCompletion: async (id: string): Promise<Objective> => {
    const { data } = await apiClient.patch(`/objectives/${id}/toggle-completion`);
    return data;
  },

  toggleKeyResultCompletion: async (objectiveId: string, keyResultId: string): Promise<KeyResult> => {
    const { data } = await apiClient.patch(`/objectives/${objectiveId}/key-results/${keyResultId}/toggle-completion`);
    return data;
  },

  // Archive operation
  archiveObjective: async (id: string): Promise<Objective> => {
    const { data } = await apiClient.patch(`/objectives/${id}/archive`);
    return data;
  },
};
