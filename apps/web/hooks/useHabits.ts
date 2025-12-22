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
  return useQuery({
    queryKey: ['habits', 'all', lifeAreaId],
    queryFn: async () => {
      // Get both active and archived habits
      const [activeHabits, archivedHabits] = await Promise.all([
        habitsApi.getAll(lifeAreaId, false), // active
        habitsApi.getAll(lifeAreaId, true),  // archived
      ]);
      return [...activeHabits, ...archivedHabits];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
  });
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
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateHabitDto }) =>
      habitsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => habitsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useLogHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: LogHabitDto) => habitsApi.logHabit(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitLogs'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
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
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};
