import { apiClient } from '../client';

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalEntryDto {
  title: string;
  content: string;
}

export interface UpdateJournalEntryDto {
  title?: string;
  content?: string;
}

export interface JournalCounts {
  active: number;
  archived: number;
  total: number;
}

export const journalApi = {
  // Create a new journal entry
  create: async (dto: CreateJournalEntryDto): Promise<JournalEntry> => {
    const response = await apiClient.post('/journal', dto);
    return response.data;
  },

  // Get all journal entries with optional search and archive filter
  getAll: async (search?: string, archived?: boolean): Promise<JournalEntry[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (archived !== undefined) params.archived = archived;
    const response = await apiClient.get('/journal', { params });
    return response.data;
  },

  // Get archived journal entries
  getArchived: async (search?: string): Promise<JournalEntry[]> => {
    const params: any = { archived: true };
    if (search) params.search = search;
    const response = await apiClient.get('/journal', { params });
    return response.data;
  },

  // Get journal counts
  getCounts: async (): Promise<JournalCounts> => {
    const response = await apiClient.get('/journal/counts');
    return response.data;
  },

  // Get a specific journal entry by ID
  getOne: async (id: string): Promise<JournalEntry> => {
    const response = await apiClient.get(`/journal/${id}`);
    return response.data;
  },

  // Update a journal entry
  update: async (id: string, dto: UpdateJournalEntryDto): Promise<JournalEntry> => {
    const response = await apiClient.patch(`/journal/${id}`, dto);
    return response.data;
  },

  // Delete a journal entry
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/journal/${id}`);
    return response.data;
  },

  // Search entries by date range
  searchByDate: async (startDate: string, endDate?: string): Promise<JournalEntry[]> => {
    const params = endDate ? { startDate, endDate } : { startDate };
    const response = await apiClient.get('/journal/search/date', { params });
    return response.data;
  },

  // Toggle archive status
  toggleArchive: async (id: string): Promise<JournalEntry> => {
    const response = await apiClient.patch(`/journal/${id}/archive`);
    return response.data;
  },
};