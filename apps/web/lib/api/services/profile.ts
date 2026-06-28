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

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await apiClient.post('/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
