import { apiClient } from '../client';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  timeTracked?: number; // seconds
}

export interface TimeTrackingEntry {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number; // seconds
  status: 'running' | 'paused' | 'completed' | 'cancelled';
}

export interface Task {
  id: string;
  userId: string;
  lifeAreaId: string;
  objectiveId?: string;
  keyResultId?: string;
  actionPlanId?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  estimatedPomodoros?: number;
  checklist?: ChecklistItem[];
  timeTracking?: TimeTrackingEntry[];
  totalTimeTracked?: number; // seconds
  archived?: boolean;
  tags?: string[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  lifeAreaId: string;
  objectiveId?: string;
  keyResultId?: string;
  actionPlanId?: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  estimatedPomodoros?: number;
  checklist?: ChecklistItem[];
  tags?: string[];
}

export interface UpdateTaskDto {
  lifeAreaId?: string;
  objectiveId?: string;
  keyResultId?: string;
  actionPlanId?: string;
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  estimatedPomodoros?: number;
  checklist?: ChecklistItem[];
  tags?: string[];
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

export interface TaskCounts {
  active: number;
  archived: number;
  total: number;
}

export const tasksApi = {
  getAll: async (lifeAreaId?: string): Promise<Task[]> => {
    const params = lifeAreaId ? { lifeAreaId } : {};
    const { data } = await apiClient.get('/tasks', { params });
    return data;
  },

  getKanban: async (lifeAreaId?: string, includeArchived?: boolean): Promise<KanbanBoard> => {
    const params: any = {};
    if (lifeAreaId) params.lifeAreaId = lifeAreaId;
    if (includeArchived !== undefined) params.includeArchived = includeArchived;
    const { data } = await apiClient.get('/tasks/kanban', { params });
    return data;
  },

  getArchived: async (lifeAreaId?: string): Promise<Task[]> => {
    const params: any = { archived: true };
    if (lifeAreaId) params.lifeAreaId = lifeAreaId;
    const { data } = await apiClient.get('/tasks', { params });
    return data;
  },

  getCounts: async (lifeAreaId?: string): Promise<TaskCounts> => {
    const params = lifeAreaId ? { lifeAreaId } : {};
    const { data } = await apiClient.get('/tasks/counts', { params });
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

  // Time Tracking
  startTimeTracking: async (id: string): Promise<Task> => {
    const { data } = await apiClient.post(`/tasks/${id}/time-tracking/start`);
    return data;
  },

  pauseTimeTracking: async (id: string, trackingId: string): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${id}/time-tracking/${trackingId}/pause`);
    return data;
  },

  stopTimeTracking: async (id: string, trackingId: string): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${id}/time-tracking/${trackingId}/stop`);
    return data;
  },

  cancelTimeTracking: async (id: string, trackingId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}/time-tracking/${trackingId}/cancel`);
  },

  // Checklist
  toggleChecklistItem: async (id: string, checklistItemId: string): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${id}/checklist/${checklistItemId}/toggle`);
    return data;
  },

  // Archive
  toggleArchive: async (id: string): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${id}/archive`);
    return data;
  },
};
