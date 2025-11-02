import { apiClient } from '../client';

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
  createdAt: string;
  updatedAt: string;
}

export interface CreateObjectiveDto {
  lifeAreaId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
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
};
