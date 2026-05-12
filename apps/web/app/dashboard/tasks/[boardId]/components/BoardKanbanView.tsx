'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Box, Button, Group, Center, Loader, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragMoveEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KanbanList } from '../../components/KanbanList';
import { KanbanCard } from '../../components/KanbanCard';
import { TaskModal } from '../../components/TaskModal';
import { Task, UpdateTaskDto, tasksApi } from '@/lib/api/services/tasks';
import {
  useUpdateTask,
  useDeleteTask,
  useToggleArchive,
  useStartTimeTracking,
  usePauseTimeTracking,
  useStopTimeTracking,
  useToggleChecklistItem,
  useCreateTask,
} from '@/hooks/useTasks';
import {
  useBoardKanban,
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn,
} from '@/hooks/useBoards';
import { KanbanColumn } from '@/lib/api/services/boards';

interface BoardKanbanViewProps {
  boardId: string;
}

const EDGE_ZONE = 80;   // px from board edge where scroll activates
const BASE_SPEED = 6;   // px/frame on entry
const ACCEL = 12;       // extra px/frame per second held in edge zone
const MAX_SPEED = 30;   // hard cap

export function BoardKanbanView({ boardId }: BoardKanbanViewProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pointerXRef = useRef(0);
  const dragStartXRef = useRef(0);
  const edgeEntryTimeRef = useRef<number | null>(null);

  const queryClient = useQueryClient();
  const { data: kanbanColumns, isLoading } = useBoardKanban(boardId);

  const createTask = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const archiveMutation = useToggleArchive();
  const startTrackingMutation = useStartTimeTracking();
  const pauseTrackingMutation = usePauseTimeTracking();
  const stopTrackingMutation = useStopTimeTracking();
  const toggleChecklistMutation = useToggleChecklistItem();
  const createColumn = useCreateColumn();
  const updateColumn = useUpdateColumn();
  const deleteColumn = useDeleteColumn();

  // Called from both onDragMove and the hold-interval
  const scrollBoardIfNeeded = useCallback((pointerX: number) => {
    const board = boardRef.current;
    if (!board || pointerX === 0) return;

    // Use VIEWPORT edges — the board element is inset by AppShell padding,
    // so getBoundingClientRect().right < screen width. Using the viewport
    // edges means the user naturally hits the scroll zone at the screen edge.
    const vw = window.innerWidth;
    const distFromLeft = pointerX;
    const distFromRight = vw - pointerX;

    const inLeft = distFromLeft >= 0 && distFromLeft < EDGE_ZONE;
    const inRight = distFromRight >= 0 && distFromRight < EDGE_ZONE;

    if (!inLeft && !inRight) {
      edgeEntryTimeRef.current = null;
      return;
    }

    if (!edgeEntryTimeRef.current) edgeEntryTimeRef.current = Date.now();
    const secondsHeld = (Date.now() - edgeEntryTimeRef.current) / 1000;
    const accelBoost = Math.min(secondsHeld * ACCEL, MAX_SPEED - BASE_SPEED);

    if (inLeft) {
      const speed = Math.ceil((1 - distFromLeft / EDGE_ZONE) * (BASE_SPEED + accelBoost));
      board.scrollLeft -= Math.min(speed, MAX_SPEED);
    } else {
      const speed = Math.ceil((1 - distFromRight / EDGE_ZONE) * (BASE_SPEED + accelBoost));
      board.scrollLeft += Math.min(speed, MAX_SPEED);
    }
  }, []);

  // Interval keeps scrolling while pointer is stationary at the edge
  useEffect(() => {
    if (!activeId) {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      edgeEntryTimeRef.current = null;
      return;
    }

    scrollIntervalRef.current = setInterval(() => {
      scrollBoardIfNeeded(pointerXRef.current);
    }, 16);

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [activeId, scrollBoardIfNeeded]);

  const updateOrderMutation = useMutation({
    mutationFn: ({ taskId, newOrder, newColumnId }: { taskId: string; newOrder: number; newColumnId: string }) =>
      tasksApi.updateOrder(taskId, { newOrder, newColumnId }),
    onMutate: async ({ taskId, newOrder, newColumnId }) => {
      await queryClient.cancelQueries({ queryKey: ['boards', boardId, 'kanban'] });
      const previous = queryClient.getQueryData(['boards', boardId, 'kanban']);

      queryClient.setQueryData(['boards', boardId, 'kanban'], (old: any) => {
        if (!old) return old;
        let taskToMove: any = null;
        const newCols = old.map((col: any) => {
          const idx = col.tasks.findIndex((t: any) => t.id === taskId);
          if (idx === -1) return col;
          taskToMove = { ...col.tasks[idx], order: newOrder };
          return { ...col, tasks: col.tasks.filter((_: any, i: number) => i !== idx) };
        });
        if (!taskToMove) return old;
        return newCols.map((col: any) => {
          if (col.id !== newColumnId) return col;
          const updated = [...col.tasks, taskToMove].sort((a: any, b: any) => a.order - b.order);
          return { ...col, tasks: updated };
        });
      });

      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['boards', boardId, 'kanban'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'kanban'], refetchType: 'none' });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findColumnOfTask = useCallback(
    (taskId: string): KanbanColumn | undefined =>
      kanbanColumns?.find((col) => col.tasks.some((t) => t.id === taskId)),
    [kanbanColumns]
  );

  const activeTask = useMemo(() => {
    if (!activeId || !kanbanColumns) return null;
    for (const col of kanbanColumns) {
      const t = col.tasks.find((t) => t.id === activeId);
      if (t) return t;
    }
    return null;
  }, [activeId, kanbanColumns]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Record initial pointer X from the activator event
    const ae = event.activatorEvent as TouchEvent | PointerEvent | MouseEvent;
    if ('touches' in ae) {
      dragStartXRef.current = (ae as TouchEvent).changedTouches?.[0]?.clientX
        ?? (ae as TouchEvent).touches?.[0]?.clientX
        ?? 0;
    } else {
      dragStartXRef.current = (ae as PointerEvent).clientX ?? 0;
    }
    pointerXRef.current = dragStartXRef.current;
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    // delta.x is the viewport-relative offset from drag start — keeps pointerXRef current
    pointerXRef.current = dragStartXRef.current + event.delta.x;
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId((event.over?.id as string) || null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      setOverId(null);
      pointerXRef.current = 0;
      dragStartXRef.current = 0;

      const { active, over } = event;
      if (!over || active.id === over.id || !kanbanColumns) return;

      const taskId = active.id as string;
      const overIdStr = over.id as string;

      const sourceCol = findColumnOfTask(taskId);
      if (!sourceCol) return;

      const columnIds = kanbanColumns.map((c) => c.id);
      let targetCol: KanbanColumn | undefined;
      let overTask: Task | undefined;

      if (columnIds.includes(overIdStr)) {
        targetCol = kanbanColumns.find((c) => c.id === overIdStr);
      } else {
        const colWithOverTask = kanbanColumns.find((c) =>
          c.tasks.some((t) => t.id === overIdStr)
        );
        if (colWithOverTask) {
          targetCol = colWithOverTask;
          overTask = colWithOverTask.tasks.find((t) => t.id === overIdStr);
        }
      }

      if (!targetCol) return;

      let newOrder: number;
      const targetTasks = targetCol.tasks;

      if (overTask) {
        const idx = targetTasks.findIndex((t) => t.id === overIdStr);
        newOrder =
          idx === 0
            ? Math.max(0, overTask.order - 1)
            : (targetTasks[idx - 1].order + overTask.order) / 2;
      } else {
        newOrder =
          targetTasks.length > 0
            ? Math.max(...targetTasks.map((t) => t.order)) + 1
            : 0;
      }

      if (targetCol.id !== sourceCol.id || overTask) {
        updateOrderMutation.mutate({ taskId, newOrder, newColumnId: targetCol.id });
      }
    },
    [kanbanColumns, findColumnOfTask, updateOrderMutation]
  );

  const handleAddTask = useCallback(
    (columnId: string, title: string) => {
      createTask.mutate(
        { title, boardId, columnId, status: 'todo', priority: 'medium' },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'kanban'] });
          },
        }
      );
    },
    [boardId, createTask, queryClient]
  );

  const handleAddColumn = () => {
    const nextOrder = kanbanColumns ? kanbanColumns.length : 0;
    createColumn.mutate({
      boardId,
      dto: { name: 'New List', order: nextOrder },
    });
  };

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" color="#4686FE" />
      </Center>
    );
  }

  if (!kanbanColumns || kanbanColumns.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Text c="dimmed" size="sm">No lists yet. Create your first list to get started.</Text>
          <Button
            leftSection={<Plus size={16} />}
            onClick={handleAddColumn}
            loading={createColumn.isPending}
            radius={10}
            style={{ backgroundColor: '#4686FE' }}
          >
            Add a list
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <>
      <style>{`
        .board-scroll::-webkit-scrollbar { height: 8px; }
        .board-scroll::-webkit-scrollbar-track { background: transparent; }
        .board-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        .board-scroll::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        .drag-overlay-card {
          transform: rotate(2deg) scale(1.04);
          box-shadow: 0 20px 50px rgba(0,0,0,0.22), 0 0 0 2px rgba(70,134,254,0.35);
          border-radius: 12px;
          opacity: 0.97;
          pointer-events: none;
        }
      `}</style>

      <Box
        ref={boardRef}
        className="board-scroll"
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          height: isMobile ? 'calc(100dvh - 140px)' : 'calc(100dvh - 170px)',
          paddingBottom: 80,
          marginLeft: isMobile ? -4 : 0,
          marginRight: isMobile ? -4 : 0,
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          autoScroll={false}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Group
            align="flex-start"
            wrap="nowrap"
            gap="md"
            style={{ minWidth: 'max-content', height: '100%', padding: '4px 2px 16px' }}
          >
            {kanbanColumns.map((col) => (
              <Box key={col.id} style={{ width: isMobile ? 260 : 272, flexShrink: 0, height: '100%' }}>
                <KanbanList
                  id={col.id}
                  title={col.name}
                  tasks={col.tasks}
                  onTaskClick={(task) => { setSelectedTask(task); setModalOpened(true); }}
                  onAddTask={handleAddTask}
                  onEditTitle={(name) =>
                    updateColumn.mutate({ boardId, columnId: col.id, dto: { name } })
                  }
                  onDelete={
                    kanbanColumns.length > 1
                      ? () => deleteColumn.mutate({ boardId, columnId: col.id })
                      : undefined
                  }
                  activeId={activeId}
                  overId={overId}
                  onToggleComplete={(taskId) => {
                    const task = kanbanColumns.flatMap((c) => c.tasks).find((t) => t.id === taskId);
                    if (!task) return;
                    const newStatus = task.status === 'done' ? 'todo' : 'done';

                    queryClient.setQueryData(['boards', boardId, 'kanban'], (old: any) => {
                      if (!old) return old;
                      return old.map((col: any) => ({
                        ...col,
                        tasks: col.tasks.map((t: any) =>
                          t.id === taskId ? { ...t, status: newStatus } : t
                        ),
                      }));
                    });

                    updateMutation.mutate(
                      { id: taskId, dto: { status: newStatus } },
                      {
                        onError: () => {
                          queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'kanban'] });
                        },
                      }
                    );
                  }}
                  onEditTask={(task) => { setSelectedTask(task); setModalOpened(true); }}
                />
              </Box>
            ))}

            <Box style={{ width: 272, flexShrink: 0, paddingTop: 2 }}>
              <Button
                variant="subtle"
                leftSection={<Plus size={16} />}
                onClick={handleAddColumn}
                loading={createColumn.isPending}
                radius={10}
                size="sm"
                style={{
                  backgroundColor: 'rgba(9,30,66,0.04)',
                  color: '#6B778C',
                  fontWeight: 500,
                  border: 'none',
                  width: '100%',
                  justifyContent: 'flex-start',
                  paddingLeft: 12,
                  height: 40,
                }}
                styles={{
                  root: {
                    '&:hover': { backgroundColor: 'rgba(9,30,66,0.08)', color: '#172B4D' },
                  },
                }}
              >
                Add another list
              </Button>
            </Box>
          </Group>

          <DragOverlay
            dropAnimation={{
              duration: 180,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
          >
            {activeTask && (
              <div className="drag-overlay-card">
                <KanbanCard task={activeTask} onClick={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </Box>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          opened={modalOpened}
          onClose={() => { setModalOpened(false); setSelectedTask(null); }}
          onSave={(id, dto: UpdateTaskDto) => updateMutation.mutate({ id, dto })}
          onDelete={(id) => { deleteMutation.mutate(id); setModalOpened(false); setSelectedTask(null); }}
          onArchive={(id) => archiveMutation.mutate(id)}
          onStartTimeTracking={(id) => startTrackingMutation.mutate(id)}
          onPauseTimeTracking={(id, trackingId) => pauseTrackingMutation.mutate({ id, trackingId })}
          onStopTimeTracking={(id, trackingId) => stopTrackingMutation.mutate({ id, trackingId })}
          onToggleChecklistItem={(taskId, itemId) => toggleChecklistMutation.mutate({ id: taskId, checklistItemId: itemId })}
        />
      )}
    </>
  );
}
