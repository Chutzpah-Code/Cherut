import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, CreateTaskDto, UpdateTaskDto, UpdateTaskOrderDto } from '@/lib/api/services/tasks';

export const useTasks = (lifeAreaId?: string) => {
  return useQuery({
    queryKey: ['tasks', lifeAreaId],
    queryFn: () => tasksApi.getAll(lifeAreaId),
  });
};

export const useKanbanBoard = (lifeAreaId?: string) => {
  return useQuery({
    queryKey: ['tasks', 'kanban', lifeAreaId],
    queryFn: () => tasksApi.getKanban(lifeAreaId),
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getOne(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTaskDto) => tasksApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) =>
      tasksApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTaskOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskOrderDto }) =>
      tasksApi.updateOrder(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useIncrementPomodoro = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.incrementPomodoro(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
