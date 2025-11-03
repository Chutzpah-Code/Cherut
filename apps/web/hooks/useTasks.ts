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

// OTIMIZADO - Update task com optimistic updates
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) =>
      tasksApi.update(id, dto),
    onMutate: async ({ id, dto }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);

      // Atualiza cache otimisticamente apenas na query principal
      queryClient.setQueryData(['tasks', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((task: any) =>
          task.id === id ? { ...task, ...dto } : task
        );
      });

      return { previousTasks };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', undefined], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
    },
  });
};

// OTIMIZADO - Update task order (drag & drop)
export const useUpdateTaskOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskOrderDto }) =>
      tasksApi.updateOrder(id, dto),
    onMutate: async ({ id, dto }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks', undefined]);

      queryClient.setQueryData(['tasks', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((task: any) =>
          task.id === id ? { ...task, status: dto.newStatus || task.status, order: dto.newOrder } : task
        );
      });

      return { previousTasks };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', undefined], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
    },
  });
};

// OTIMIZADO - Increment pomodoro (super rápido)
export const useIncrementPomodoro = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.incrementPomodoro(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks', undefined]);

      queryClient.setQueryData(['tasks', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((task: any) =>
          task.id === id
            ? { ...task, pomodoroCount: (task.pomodoroCount || 0) + 1 }
            : task
        );
      });

      return { previousTasks };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', undefined], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
    },
  });
};

// OTIMIZADO - Delete task (remove instantaneamente)
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks', undefined]);

      // Remove imediatamente da UI
      queryClient.setQueryData(['tasks', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((task: any) => task.id !== id);
      });

      return { previousTasks };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', undefined], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
    },
  });
};
