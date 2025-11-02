import { apiClient } from '../client';

export interface Task {
  id: string;
  userId: string;
  lifeAreaId: string;
  objectiveId?: string;
  actionPlanId?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  estimatedPomodoros?: number;
  completedPomodoros: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  lifeAreaId: string;
  objectiveId?: string;
  actionPlanId?: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  estimatedPomodoros?: number;
}

export interface UpdateTaskDto {
  lifeAreaId?: string;
  objectiveId?: string;
  actionPlanId?: string;
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  estimatedPomodoros?: number;
}

export interface UpdateTaskOrderDto {
  newOrder: number;
  newStatus?: 'todo' | 'in_progress' | 'done';
}

export interface KanbanBoard {
  todo: Task[];
  in_progress: Task[];
  done: Task[];
}

export const tasksApi = {
  getAll: async (lifeAreaId?: string): Promise<Task[]> => {
    const params = lifeAreaId ? { lifeAreaId } : {};
    const { data } = await apiClient.get('/tasks', { params });
    return data;
  },

  getKanban: async (lifeAreaId?: string): Promise<KanbanBoard> => {
    const params = lifeAreaId ? { lifeAreaId } : {};
    const { data } = await apiClient.get('/tasks/kanban', { params });
    return data;
  },

  getOne: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get(`/tasks/${id}`);
    return data;
  },

  create: async (dto: CreateTaskDto): Promise<Task> => {
    const { data } = await apiClient.post('/tasks', dto);
    return data;
  },

  update: async (id: string, dto: UpdateTaskDto): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${id}`, dto);
    return data;
  },

  updateOrder: async (id: string, dto: UpdateTaskOrderDto): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${id}/order`, dto);
    return data;
  },

  incrementPomodoro: async (id: string): Promise<Task> => {
    const { data } = await apiClient.post(`/tasks/${id}/pomodoro`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
