import { apiClient } from '../client';

export interface KeyResult {
  id: string;
  objectiveId: string;
  userId: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export const keyResultsApi = {
  getAll: async (objectiveId?: string): Promise<KeyResult[]> => {
    const params = objectiveId ? { objectiveId } : {};
    const { data } = await apiClient.get('/key-results', { params });
    return data;
  },

  getOne: async (id: string): Promise<KeyResult> => {
    const { data } = await apiClient.get(`/key-results/${id}`);
    return data;
  },
};
