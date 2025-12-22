import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalApi, CreateJournalEntryDto, UpdateJournalEntryDto } from '@/lib/api/services/journal';

export const useJournalEntries = (search?: string, archived?: boolean) => {
  return useQuery({
    queryKey: ['journal', search, archived],
    queryFn: () => journalApi.getAll(search, archived),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAllJournalEntries = (search?: string) => {
  return useQuery({
    queryKey: ['journal', 'all', search],
    queryFn: async () => {
      const [activeEntries, archivedEntries] = await Promise.all([
        journalApi.getAll(search, false),
        journalApi.getArchived(search),
      ]);
      return [...activeEntries, ...archivedEntries];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useArchivedJournalEntries = (search?: string) => {
  return useQuery({
    queryKey: ['journal', 'archived', search],
    queryFn: () => journalApi.getArchived(search),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useJournalCounts = () => {
  return useQuery({
    queryKey: ['journal', 'counts'],
    queryFn: () => journalApi.getCounts(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useJournalEntry = (id: string) => {
  return useQuery({
    queryKey: ['journal', id],
    queryFn: () => journalApi.getOne(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateJournalEntryDto) => journalApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });
};

export const useUpdateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateJournalEntryDto }) =>
      journalApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });
};

export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => journalApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });
};

export const useJournalEntriesByDate = (startDate: string, endDate?: string) => {
  return useQuery({
    queryKey: ['journal', 'date', startDate, endDate],
    queryFn: () => journalApi.searchByDate(startDate, endDate),
    enabled: !!startDate,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
  });
};

export const useToggleJournalArchive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => journalApi.toggleArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });
};