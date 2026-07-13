import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi, CreateHabitDto, UpdateHabitDto, LogHabitDto } from '@/lib/api/services/habits';

export const useHabits = (lifeAreaId?: string, archived?: boolean) => {
  return useQuery({
    queryKey: ['habits', lifeAreaId, archived],
    queryFn: () => habitsApi.getAll(lifeAreaId, archived),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
  });
};

export const useAllHabits = (lifeAreaId?: string) => {
  // Reuse the same query keys as useHabits(active) and useArchivedHabits so
  // React Query deduplicates the requests when both hooks are mounted on the same page.
  const activeQuery = useQuery({
    queryKey: ['habits', lifeAreaId, false],
    queryFn: () => habitsApi.getAll(lifeAreaId, false),
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
  });

  const archivedQuery = useQuery({
    queryKey: ['habits', 'archived', lifeAreaId],
    queryFn: () => habitsApi.getArchived(lifeAreaId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    data: (activeQuery.data || archivedQuery.data)
      ? [...(activeQuery.data ?? []), ...(archivedQuery.data ?? [])]
      : undefined,
    isLoading: activeQuery.isLoading || archivedQuery.isLoading,
    error: activeQuery.error ?? archivedQuery.error,
  };
};

export const useHabit = (id: string) => {
  return useQuery({
    queryKey: ['habits', id],
    queryFn: () => habitsApi.getOne(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateHabitDto) => habitsApi.create(dto),
    onSuccess: () => {
      // Invalidate active list and counts; archived list is unaffected
      queryClient.invalidateQueries({ queryKey: ['habits', undefined, false] });
      queryClient.invalidateQueries({ queryKey: ['habits', undefined, undefined] });
      queryClient.invalidateQueries({ queryKey: ['habits', 'counts'] });
    },
  });
};

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateHabitDto }) =>
      habitsApi.update(id, dto),
    onSuccess: (_data, { id }) => {
      // Only invalidate the specific habit and list queries; counts/archived unaffected by edits
      queryClient.invalidateQueries({ queryKey: ['habits', id], exact: true });
      queryClient.invalidateQueries({ queryKey: ['habits', undefined, false] });
      queryClient.invalidateQueries({ queryKey: ['habits', undefined, undefined] });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => habitsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', undefined, false] });
      queryClient.invalidateQueries({ queryKey: ['habits', undefined, undefined] });
      queryClient.invalidateQueries({ queryKey: ['habits', 'counts'] });
    },
  });
};

export const usePermanentDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => habitsApi.permanentDelete(id),
    onSuccess: () => {
      // Could be active or archived — invalidate both lists and counts
      queryClient.invalidateQueries({ queryKey: ['habits', undefined, false] });
      queryClient.invalidateQueries({ queryKey: ['habits', undefined, undefined] });
      queryClient.invalidateQueries({ queryKey: ['habits', 'archived'] });
      queryClient.invalidateQueries({ queryKey: ['habits', 'counts'] });
    },
  });
};

export const useLogHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: LogHabitDto) => habitsApi.logHabit(dto),
    onSuccess: (_data, dto) => {
      queryClient.invalidateQueries({ queryKey: ['habitLogs'] });
      // Refresh habit list so lastCompletedAt reflects immediately after page reload
      if (dto.completed) {
        queryClient.invalidateQueries({ queryKey: ['habits'] });
      }
    },
  });
};

export const useHabitLogs = (habitId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['habitLogs', habitId, startDate, endDate],
    queryFn: () => habitsApi.getHabitLogs(habitId, startDate, endDate),
    enabled: !!habitId,
    staleTime: 1 * 60 * 1000, // 1 minute - logs change frequently
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useArchivedHabits = (lifeAreaId?: string) => {
  return useQuery({
    queryKey: ['habits', 'archived', lifeAreaId],
    queryFn: () => habitsApi.getArchived(lifeAreaId),
    staleTime: 5 * 60 * 1000, // 5 minutes - archived habits change less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useHabitCounts = (lifeAreaId?: string) => {
  return useQuery({
    queryKey: ['habits', 'counts', lifeAreaId],
    queryFn: () => habitsApi.getCounts(lifeAreaId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useToggleArchive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => habitsApi.toggleArchive(id),
    onSuccess: () => {
      // Archive toggle moves between active/archived — both lists and counts change
      queryClient.invalidateQueries({ queryKey: ['habits', undefined, false] });
      queryClient.invalidateQueries({ queryKey: ['habits', undefined, undefined] });
      queryClient.invalidateQueries({ queryKey: ['habits', 'archived'] });
      queryClient.invalidateQueries({ queryKey: ['habits', 'counts'] });
    },
  });
};
