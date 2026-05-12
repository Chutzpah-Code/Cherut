import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, CreateTaskDto, UpdateTaskDto, UpdateTaskOrderDto } from '@/lib/api/services/tasks';

export const useTasks = (lifeAreaId?: string) => {
  return useQuery({
    queryKey: ['tasks', lifeAreaId],
    queryFn: () => tasksApi.getAll(lifeAreaId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useKanbanBoard = (lifeAreaId?: string, includeArchived?: boolean) => {
  return useQuery({
    queryKey: ['tasks', 'kanban', lifeAreaId, includeArchived],
    queryFn: () => tasksApi.getKanban(lifeAreaId, includeArchived),
    staleTime: 2 * 60 * 1000, // 2 minutes - kanban needs fresher data
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useArchivedTasks = (lifeAreaId?: string) => {
  return useQuery({
    queryKey: ['tasks', 'archived', lifeAreaId],
    queryFn: () => tasksApi.getArchived(lifeAreaId),
    staleTime: 5 * 60 * 1000, // 5 minutes - archived tasks change less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTaskCounts = (lifeAreaId?: string) => {
  return useQuery({
    queryKey: ['tasks', 'counts', lifeAreaId],
    queryFn: () => tasksApi.getCounts(lifeAreaId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getOne(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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
      const previousKanbanEntries = queryClient.getQueriesData<any>({ queryKey: ['tasks', 'kanban'] });

      queryClient.setQueryData(['tasks', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((task: any) => task.id === id ? { ...task, ...dto } : task);
      });

      queryClient.setQueryData(['tasks', id], (old: any) => {
        if (!old) return old;
        return { ...old, ...dto };
      });

      // Update ALL kanban cache entries regardless of params
      queryClient.setQueriesData<any>({ queryKey: ['tasks', 'kanban'] }, (old: any) => {
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

      return { previousTasks, previousTask, previousKanbanEntries };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', undefined], context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', _vars.id], context.previousTask);
      }
      if (context?.previousKanbanEntries) {
        for (const [key, data] of context.previousKanbanEntries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false, refetchType: 'none' });
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
      await queryClient.cancelQueries({ queryKey: ['tasks', 'kanban'] });

      // Snapshot all kanban cache entries (key includes lifeAreaId + includeArchived params)
      const previousKanbanEntries = queryClient.getQueriesData<any>({ queryKey: ['tasks', 'kanban'] });

      const updater = (old: any) => {
        if (!old) return old;
        const { newStatus, newOrder } = dto;
        const newBoard = { ...old };

        let taskToMove: any = null;
        let sourceColumn: 'todo' | 'in_progress' | 'done' | null = null;

        for (const col of ['todo', 'in_progress', 'done'] as const) {
          const idx = newBoard[col]?.findIndex((t: any) => t.id === id);
          if (idx !== -1) {
            taskToMove = { ...newBoard[col][idx] };
            sourceColumn = col;
            break;
          }
        }

        if (!taskToMove || !sourceColumn) return old;

        if (newStatus) taskToMove.status = newStatus;
        taskToMove.order = newOrder;

        const targetColumn = newStatus || sourceColumn;

        newBoard[sourceColumn] = newBoard[sourceColumn].filter((t: any) => t.id !== id);
        if (!newBoard[targetColumn]) newBoard[targetColumn] = [];

        const targetTasks = [...newBoard[targetColumn], taskToMove];
        targetTasks.sort((a: any, b: any) => a.order - b.order);
        newBoard[targetColumn] = targetTasks;

        return newBoard;
      };

      // Apply optimistic update to ALL kanban cache entries regardless of params
      queryClient.setQueriesData<any>({ queryKey: ['tasks', 'kanban'] }, updater);

      return { previousKanbanEntries };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousKanbanEntries) {
        for (const [key, data] of context.previousKanbanEntries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      // Mark stale without immediate refetch — optimistic state is already correct
      queryClient.invalidateQueries({ queryKey: ['tasks', 'kanban'], exact: false, refetchType: 'none' });
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
