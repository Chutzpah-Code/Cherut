import apiClient from '../client';

export interface Value {
  id: string;
  title: string;
  shortDescription?: string;
  behaviors?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateValueDto {
  title: string;
  shortDescription?: string;
  behaviors?: string;
}

export interface UpdateValueDto extends Partial<CreateValueDto> {}

export const valuesApi = {
  getAll: async (): Promise<Value[]> => {
    const { data } = await apiClient.get('/values');
    return data;
  },

  getOne: async (id: string): Promise<Value> => {
    const { data } = await apiClient.get(`/values/${id}`);
    return data;
  },

  create: async (dto: CreateValueDto): Promise<Value> => {
    const { data } = await apiClient.post('/values', dto);
    return data;
  },

  update: async (id: string, dto: UpdateValueDto): Promise<Value> => {
    const { data } = await apiClient.patch(`/values/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/values/${id}`);
  },
};