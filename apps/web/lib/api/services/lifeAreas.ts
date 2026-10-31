import apiClient from '../client';

export interface LifeArea {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isSystemPreset?: boolean;
  presetSlug?: string;
  nameOverridden?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LifeAreaImpactGroup {
  count: number;
  items: { id: string; title: string }[];
}

export interface LifeAreaImpact {
  objectives: LifeAreaImpactGroup;
  habits: LifeAreaImpactGroup;
  tasks: LifeAreaImpactGroup;
}

export interface CreateLifeAreaDto {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateLifeAreaDto extends Partial<CreateLifeAreaDto> {}

export const lifeAreasApi = {
  getAll: async (): Promise<LifeArea[]> => {
    const { data } = await apiClient.get('/life-areas');
    return data;
  },

  getOne: async (id: string): Promise<LifeArea> => {
    const { data } = await apiClient.get(`/life-areas/${id}`);
    return data;
  },

  create: async (dto: CreateLifeAreaDto): Promise<LifeArea> => {
    const { data } = await apiClient.post('/life-areas', dto);
    return data;
  },

  update: async (id: string, dto: UpdateLifeAreaDto): Promise<LifeArea> => {
    const { data } = await apiClient.patch(`/life-areas/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/life-areas/${id}`);
  },

  getImpact: async (id: string): Promise<LifeAreaImpact> => {
    const { data } = await apiClient.get(`/life-areas/${id}/impact`);
    return data;
  },
};
