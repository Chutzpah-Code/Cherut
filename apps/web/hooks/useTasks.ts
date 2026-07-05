import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
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
    onMutate: async (dto) => {
      const tempId = `temp-${Date.now()}`;
      const tempTask = {
        id: tempId,
        title: dto.title,
        status: dto.status || 'todo',
        priority: dto.priority || 'medium',
        order: 9999,
        lifeAreaId: dto.lifeAreaId,
        boardId: dto.boardId,
        columnId: dto.columnId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeTracking: [],
        checklist: [],
        pomodoroCount: 0,
        archived: false,
      };

      // Optimistic update: tasks kanban ({ todo, in_progress, done } structure)
      await queryClient.cancelQueries({ queryKey: ['tasks', 'kanban'] });
      const previousKanbanEntries = queryClient.getQueriesData<any>({ queryKey: ['tasks', 'kanban'] });
      queryClient.setQueriesData<any>({ queryKey: ['tasks', 'kanban'] }, (old: any) => {
        if (!old || typeof old !== 'object' || Array.isArray(old)) return old;
        const col = (dto.status as string) || 'todo';
        if (!(col in old)) return old;
        return { ...old, [col]: [...(old[col] || []), tempTask] };
      });

      // Optimistic update: board kanban (array of columns structure)
      let previousBoardEntry: any;
      if (dto.boardId && dto.columnId) {
        await queryClient.cancelQueries({ queryKey: ['boards', dto.boardId, 'kanban'] });
        previousBoardEntry = queryClient.getQueryData(['boards', dto.boardId, 'kanban']);
        queryClient.setQueryData(['boards', dto.boardId, 'kanban'], (old: any) => {
          if (!old || !Array.isArray(old)) return old;
          return old.map((col: any) =>
            col.id === dto.columnId ? { ...col, tasks: [...(col.tasks || []), tempTask] } : col
          );
        });
      }

      return { previousKanbanEntries, previousBoardEntry };
    },
    onError: (_err, dto, context: any) => {
      if (context?.previousKanbanEntries) {
        for (const [key, data] of context.previousKanbanEntries) {
          queryClient.setQueryData(key, data);
        }
      }
      if (context?.previousBoardEntry && dto.boardId) {
        queryClient.setQueryData(['boards', dto.boardId, 'kanban'], context.previousBoardEntry);
      }
    },
    onSettled: (_data, _err, dto) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      if (dto?.boardId) {
        queryClient.invalidateQueries({ queryKey: ['boards', dto.boardId, 'kanban'] });
      }
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
      await queryClient.cancelQueries({ queryKey: ['boards'] });

      const previousTasks = queryClient.getQueryData(['tasks', undefined]);
      const previousTask = queryClient.getQueryData(['tasks', id]);
      const previousKanbanEntries = queryClient.getQueriesData<any>({ queryKey: ['tasks', 'kanban'] });
      const previousBoardEntries = queryClient.getQueriesData<any>({ queryKey: ['boards'] });

      queryClient.setQueryData(['tasks', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((task: any) => task.id === id ? { ...task, ...dto } : task);
      });

      queryClient.setQueryData(['tasks', id], (old: any) => {
        if (!old) return old;
        return { ...old, ...dto };
      });

      // Update tasks kanban ({ todo, in_progress, done } structure)
      queryClient.setQueriesData<any>({ queryKey: ['tasks', 'kanban'] }, (old: any) => {
        if (!old || typeof old !== 'object' || Array.isArray(old)) return old;
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

      // Update board kanban (array of columns structure)
      queryClient.setQueriesData<any>({ queryKey: ['boards'] }, (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        // Only process column arrays (each column has { id, tasks[] })
        if (!old[0]?.tasks) return old;
        return old.map((col: any) => ({
          ...col,
          tasks: (col.tasks || []).map((task: any) =>
            task.id === id ? { ...task, ...dto } : task
          ),
        }));
      });

      return { previousTasks, previousTask, previousKanbanEntries, previousBoardEntries };
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
      if (context?.previousBoardEntries) {
        for (const [key, data] of context.previousBoardEntries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false, refetchType: 'none' });
      queryClient.invalidateQueries({ queryKey: ['boards'], exact: false, refetchType: 'none' });
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
      const previousKanbanEntries = queryClient.getQueriesData<any>({ queryKey: ['tasks', 'kanban'] });
      const previousBoardEntries = queryClient.getQueriesData<any>({ queryKey: ['boards'] });

      queryClient.setQueryData(['tasks', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((task: any) => task.id !== id);
      });

      const removeFromKanban = (old: any) => {
        if (!old || typeof old !== 'object' || Array.isArray(old)) return old;
        if (!('todo' in old) && !('in_progress' in old) && !('done' in old)) return old;
        return {
          ...old,
          todo: (old.todo || []).filter((t: any) => t.id !== id),
          in_progress: (old.in_progress || []).filter((t: any) => t.id !== id),
          done: (old.done || []).filter((t: any) => t.id !== id),
        };
      };

      queryClient.setQueriesData<any>({ queryKey: ['tasks', 'kanban'] }, removeFromKanban);
      queryClient.setQueriesData<any>({ queryKey: ['boards'] }, removeFromKanban);

      return { previousTasks, previousKanbanEntries, previousBoardEntries };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', undefined], context.previousTasks);
      }
      if (context?.previousKanbanEntries) {
        for (const [key, data] of context.previousKanbanEntries) {
          queryClient.setQueryData(key, data);
        }
      }
      if (context?.previousBoardEntries) {
        for (const [key, data] of context.previousBoardEntries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSuccess: () => {
      notifications.show({
        title: 'Task deleted',
        message: 'The task has been removed.',
        color: 'red',
        autoClose: 3000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['boards'], exact: false });
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
      queryClient.invalidateQueries({ queryKey: ['boards'] });
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
      queryClient.invalidateQueries({ queryKey: ['boards'] });
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
      queryClient.invalidateQueries({ queryKey: ['boards'] });
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
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

export const useAddManualTimeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { startTime: string; endTime: string } }) =>
      tasksApi.addManualTimeEntry(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

export const useEditTimeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, trackingId, dto }: { id: string; trackingId: string; dto: { startTime?: string; endTime?: string } }) =>
      tasksApi.editTimeEntry(id, trackingId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, trackingId }: { id: string; trackingId: string }) =>
      tasksApi.deleteTimeEntry(id, trackingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
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

// Recurring date toggle — optimistic update on completedDates
export const useToggleRecurringDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      tasksApi.toggleRecurringDate(id, date),
    onMutate: async ({ id, date }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const updateTask = (task: any) => {
        if (task?.id !== id) return task;
        const current: string[] = task.completedDates ?? [];
        const completedDates = current.includes(date)
          ? current.filter((d: string) => d !== date)
          : [...current, date].sort();
        return { ...task, completedDates };
      };

      const previousData = queryClient.getQueriesData({ queryKey: ['tasks'] });

      queryClient.setQueriesData<any>({ queryKey: ['tasks', 'kanban'] }, (old: any) => {
        if (!old) return old;
        const updated = { ...old };
        for (const col of ['todo', 'in_progress', 'done'] as const) {
          if (updated[col]) updated[col] = updated[col].map(updateTask);
        }
        return updated;
      });

      queryClient.setQueryData(['tasks', id], (old: any) => updateTask(old));

      return { previousData };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false, refetchType: 'none' });
    },
  });
};
