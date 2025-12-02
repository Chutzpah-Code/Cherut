import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalApi, CreateJournalEntryDto, UpdateJournalEntryDto } from '@/lib/api/services/journal';

export const useJournalEntries = (search?: string) => {
  return useQuery({
    queryKey: ['journal', search],
    queryFn: () => journalApi.getAll(search),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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