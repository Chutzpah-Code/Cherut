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
      const previousTasks = queryClient.getQueryData(['tasks', undefined]);
      const previousTask = queryClient.getQueryData(['tasks', id]);

      // Atualiza cache otimisticamente na query principal
      queryClient.setQueryData(['tasks', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((task: any) =>
          task.id === id ? { ...task, ...dto } : task
        );
      });

      // Atualiza cache otimisticamente na query individual da task
      queryClient.setQueryData(['tasks', id], (old: any) => {
        if (!old) return old;
        return { ...old, ...dto };
      });

      // Atualiza cache otimisticamente no kanban board
      queryClient.setQueryData(['tasks', 'kanban', undefined], (old: any) => {
        if (!old) return old;

        const newBoard = { ...old };
        for (const col of ['todo', 'in_progress', 'done'] as const) {
          if (newBoard[col]) {
            newBoard[col] = newBoard[col].map((task: any) =>
              task.id === id ? { ...task, ...dto } : task
            );
          }
        }
        return newBoard;
      });

      return { previousTasks, previousTask };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', undefined], context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', _vars.id], context.previousTask);
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
      // Cancel all outgoing queries
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Save previous state for rollback
      const previousKanban = queryClient.getQueryData(['tasks', 'kanban', undefined]);

      // Optimistically update the kanban board
      queryClient.setQueryData(['tasks', 'kanban', undefined], (old: any) => {
        if (!old) return old;

        const { newStatus, newOrder } = dto;

        // Create a copy of the board
        const newBoard = { ...old };

        // Find the task in all columns
        let taskToMove: any = null;
        let sourceColumn: 'todo' | 'in_progress' | 'done' | null = null;

        for (const col of ['todo', 'in_progress', 'done'] as const) {
          const taskIndex = newBoard[col]?.findIndex((t: any) => t.id === id);
          if (taskIndex !== -1) {
            taskToMove = { ...newBoard[col][taskIndex] };
            sourceColumn = col;
            break;
          }
        }

        if (!taskToMove || !sourceColumn) return old;

        // Update task properties
        if (newStatus) taskToMove.status = newStatus;
        taskToMove.order = newOrder;

        const targetColumn = newStatus || sourceColumn;

        // Remove from source column
        newBoard[sourceColumn] = newBoard[sourceColumn].filter((t: any) => t.id !== id);

        // Add to target column at the correct position
        if (!newBoard[targetColumn]) newBoard[targetColumn] = [];

        // Insert at the correct index based on order
        const targetTasks = [...newBoard[targetColumn], taskToMove];
        targetTasks.sort((a: any, b: any) => a.order - b.order);
        newBoard[targetColumn] = targetTasks;

        return newBoard;
      });

      return { previousKanban };
    },
    onError: (_err, _vars, context: any) => {
      // Rollback on error
      if (context?.previousKanban) {
        queryClient.setQueryData(['tasks', 'kanban', undefined], context.previousKanban);
      }
    },
    onSettled: () => {
      // Refetch to sync with server
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

// Time Tracking Hooks
export const useStartTimeTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.startTimeTracking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const usePauseTimeTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, trackingId }: { id: string; trackingId: string }) =>
      tasksApi.pauseTimeTracking(id, trackingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useStopTimeTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, trackingId }: { id: string; trackingId: string }) =>
      tasksApi.stopTimeTracking(id, trackingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useCancelTimeTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, trackingId }: { id: string; trackingId: string }) =>
      tasksApi.cancelTimeTracking(id, trackingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Checklist Hook
export const useToggleChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, checklistItemId }: { id: string; checklistItemId: string }) =>
      tasksApi.toggleChecklistItem(id, checklistItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Archive Hook
export const useToggleArchive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.toggleArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
