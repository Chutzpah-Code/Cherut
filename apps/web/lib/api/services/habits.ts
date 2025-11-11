import { apiClient } from '../client';

export interface Habit {
  id: string;
  userId: string;
  lifeAreaId?: string;
  title: string;
  description?: string;
  category: 'good' | 'bad';
  type: 'boolean' | 'counter' | 'duration';
  frequency: 'daily' | 'weekly' | 'monthly';
  targetValue?: number;
  unit?: string;
  weekDays?: number[];
  reminderTime?: string;
  startDate?: string;
  dueDate?: string;
  isActive: boolean;
  streak: number;
  lastCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  userId: string;
  habitId: string;
  date: string;
  completed?: boolean;
  value?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitDto {
  title: string;
  description?: string;
  category: 'good' | 'bad';
  type: 'boolean' | 'counter' | 'duration';
  frequency: 'daily' | 'weekly' | 'monthly';
  targetValue?: number;
  unit?: string;
  weekDays?: number[];
  reminderTime?: string;
  lifeAreaId?: string;
  startDate?: string;
  dueDate?: string;
}

export interface UpdateHabitDto {
  title?: string;
  description?: string;
  category?: 'good' | 'bad';
  type?: 'boolean' | 'counter' | 'duration';
  frequency?: 'daily' | 'weekly' | 'monthly';
  targetValue?: number;
  unit?: string;
  weekDays?: number[];
  reminderTime?: string;
  lifeAreaId?: string;
  startDate?: string;
  dueDate?: string;
  isActive?: boolean;
}

export interface LogHabitDto {
  habitId: string;
  date: string;
  completed?: boolean;
  value?: number;
  notes?: string;
}

export const habitsApi = {
  // Habits CRUD
  getAll: async (lifeAreaId?: string): Promise<Habit[]> => {
    const params = lifeAreaId ? { lifeAreaId } : {};
    const { data } = await apiClient.get('/habits', { params });
    return data;
  },

  getOne: async (id: string): Promise<Habit> => {
    const { data } = await apiClient.get(`/habits/${id}`);
    return data;
  },

  create: async (dto: CreateHabitDto): Promise<Habit> => {
    const { data } = await apiClient.post('/habits', dto);
    return data;
  },

  update: async (id: string, dto: UpdateHabitDto): Promise<Habit> => {
    const { data } = await apiClient.patch(`/habits/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/habits/${id}`);
  },

  // Habit Logs
  logHabit: async (dto: LogHabitDto): Promise<HabitLog> => {
    const { data } = await apiClient.post('/habits/log', dto);
    return data;
  },

  getHabitLogs: async (
    habitId: string,
    startDate?: string,
    endDate?: string
  ): Promise<HabitLog[]> => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const { data } = await apiClient.get(`/habits/${habitId}/logs`, { params });
    return data;
  },
};
