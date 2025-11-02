import { apiClient } from '../client';

export interface Profile {
  userId: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  timezone?: string;
  language?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    weekStartsOn?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileDto {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  timezone?: string;
  language?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    weekStartsOn?: number;
  };
}

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  timezone?: string;
  language?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    weekStartsOn?: number;
  };
}

export const profileApi = {
  get: async (): Promise<Profile> => {
    const { data } = await apiClient.get('/profile');
    return data;
  },

  create: async (dto: CreateProfileDto): Promise<Profile> => {
    const { data } = await apiClient.post('/profile', dto);
    return data;
  },

  update: async (dto: UpdateProfileDto): Promise<Profile> => {
    const { data } = await apiClient.patch('/profile', dto);
    return data;
  },
};
