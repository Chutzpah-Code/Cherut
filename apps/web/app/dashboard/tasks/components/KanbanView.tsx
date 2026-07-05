'use client';

import { useState, useCallback, useMemo } from 'react';
import { Box, Loader, Center, Group, Button, Modal, TextInput, Stack, Select, Text } from '@mantine/core';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import {
  useKanbanBoard,
  useUpdateTask,
  useDeleteTask,
  useToggleArchive,
  useStartTimeTracking,
  usePauseTimeTracking,
  useStopTimeTracking,
  useToggleChecklistItem,
  useCreateTask,
  useUpdateTaskOrder,
  useArchivedTasks,
  useTaskCounts,
} from '@/hooks/useTasks';
import { Task, CreateTaskDto, UpdateTaskDto } from '@/lib/api/services/tasks';
import { KanbanList } from './KanbanList';
import { KanbanCard } from './KanbanCard';
import { TaskModal } from './TaskModal';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { TaskFilter, TaskFilter as TaskFilterType } from './TaskFilter';

interface KanbanViewProps {
  currentFilter: TaskFilterType;
  onFilterChange: (filter: TaskFilterType) => void;
}

export function KanbanView({ currentFilter, onFilterChange }: KanbanViewProps) {
  const { data: kanban, isLoading: kanbanLoading } = useKanbanBoard(undefined, false);
  const { data: archivedTasks, isLoading: archivedLoading } = useArchivedTasks();
  const { data: taskCounts } = useTaskCounts();

  const isLoading = kanbanLoading || (currentFilter === 'archived' && archivedLoading);
  const { data: lifeAreas } = useLifeAreas();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const archiveMutation = useToggleArchive();
  const startTrackingMutation = useStartTimeTracking();
  const pauseTrackingMutation = usePauseTimeTracking();
  const stopTrackingMutation = useStopTimeTracking();
  const toggleChecklistMutation = useToggleChecklistItem();
  const createMutation = useCreateTask();
  const updateOrderMutation = useUpdateTaskOrder();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<string>('todo');
  const [newTaskData, setNewTaskData] = useState<CreateTaskDto>({
    title: '',
    lifeAreaId: '',
    priority: 'medium',
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long-press to distinguish drag from tap/scroll
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id as string || null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);
    const { active, over } = event;

    if (!over) {
      return;
    }

    const taskId = active.id as string;
    const overId = over.id as string;

    // Find the source task
    const activeTask = kanban?.todo.find(t => t.id === taskId)
      || kanban?.in_progress.find(t => t.id === taskId)
      || kanban?.done.find(t => t.id === taskId);

    if (!activeTask) {
      return;
    }

    // Find which column the task is being dropped into
    let targetStatus: 'todo' | 'in_progress' | 'done' | null = null;
    let overTask: Task | undefined = undefined;

    // Check if overId is a column
    if (['todo', 'in_progress', 'done'].includes(overId)) {
      targetStatus = overId as 'todo' | 'in_progress' | 'done';
    } else {
      // overId is a task, find which column that task belongs to
      overTask = kanban?.todo.find(t => t.id === overId)
        || kanban?.in_progress.find(t => t.id === overId)
        || kanban?.done.find(t => t.id === overId);

      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (!targetStatus) {
      return;
    }

    // If moving to a different column
    if (targetStatus !== activeTask.status) {
      const targetColumnTasks = kanban?.[targetStatus] || [];

      let newOrder: number;

      if (overTask) {
        const overTaskIndex = targetColumnTasks.findIndex(t => t.id === overId);
        if (overTaskIndex === 0) {
          newOrder = overTask.order - 1;
        } else {
          const beforeTask = targetColumnTasks[overTaskIndex - 1];
          newOrder = (beforeTask.order + overTask.order) / 2;
        }
      } else {
        newOrder = targetColumnTasks.length > 0 ? Math.max(...targetColumnTasks.map(t => t.order)) + 1 : 0;
      }

      updateOrderMutation.mutate({
        id: taskId,
        dto: {
          newStatus: targetStatus,
          newOrder: newOrder,
        },
      });
    }
    // If reordering within the same column
    else if (taskId !== overId && overTask) {
      const currentColumnTasks = kanban?.[targetStatus] || [];
      const oldIndex = currentColumnTasks.findIndex(t => t.id === taskId);
      const newIndex = currentColumnTasks.findIndex(t => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {

        // Calculate new order based on position relative to overTask
        let newOrder: number;

        if (newIndex === 0) {
          newOrder = overTask.order - 1;
        } else if (newIndex === currentColumnTasks.length - 1) {
          // Moving to the bottom
          newOrder = overTask.order + 1;
        } else {
          // Moving between tasks - calculate order between adjacent tasks
          const beforeTask = currentColumnTasks[newIndex - (oldIndex < newIndex ? 0 : 1)];
          const afterTask = currentColumnTasks[newIndex + (oldIndex < newIndex ? 1 : 0)];
          newOrder = (beforeTask.order + afterTask.order) / 2;
        }

        // Single optimistic update call
        updateOrderMutation.mutate({
          id: taskId,
          dto: {
            newStatus: targetStatus,
            newOrder: newOrder,
          },
        });
      }
    }
  }, [kanban, updateOrderMutation]);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setModalOpened(true);
  }, []);

  const handleSaveTask = useCallback((id: string, updates: UpdateTaskDto) => {
    updateMutation.mutate({ id, dto: updates });
    setModalOpened(false);
  }, [updateMutation]);

  const handleDeleteTask = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const handleToggleComplete = useCallback((taskId: string) => {
    // Find the task in kanban data directly to avoid dependency on lists
    const task = kanban?.todo.find(t => t.id === taskId)
      || kanban?.in_progress.find(t => t.id === taskId)
      || kanban?.done.find(t => t.id === taskId);

    if (!task) return;

    // Toggle between done and todo
    const newStatus = task.status === 'done' ? 'todo' : 'done';

    updateOrderMutation.mutate({
      id: taskId,
      dto: {
        newStatus: newStatus,
        newOrder: task.order, // Keep same order
      },
    });
  }, [kanban, updateOrderMutation]);


  const handleArchiveTask = (id: string) => {
    archiveMutation.mutate(id);
  };

  const handleUnarchiveTask = (task: Task) => {
    archiveMutation.mutate(task.id);
  };

  const handleCreateTask = () => {
    if (!newTaskData.title || !newTaskData.lifeAreaId) return;

    const targetCol = kanban?.[newTaskStatus as keyof typeof kanban] as any[] | undefined;
    const maxOrder = targetCol?.length
      ? Math.max(...targetCol.map((t: any) => t.order ?? 0)) + 1
      : 0;

    createMutation.mutate({ ...newTaskData, status: newTaskStatus as any, order: maxOrder });

    setNewTaskData({ title: '', lifeAreaId: '', priority: 'medium' });
    setCreateModalOpened(false);
  };

  // Organize archived tasks by status if on archived filter - Memoized for performance
  const archivedTasksByStatus = useMemo(() => {
    if (currentFilter !== 'archived' || !archivedTasks) return null;
    return {
      todo: archivedTasks.filter(task => task.status === 'todo'),
      in_progress: archivedTasks.filter(task => task.status === 'in_progress'),
      done: archivedTasks.filter(task => task.status === 'done'),
    };
  }, [currentFilter, archivedTasks]);

  const lists = useMemo(() => {
    if (currentFilter === 'archived' && archivedTasksByStatus) {
      return [
        { id: 'todo', title: 'To Do', color: 'gray', tasks: archivedTasksByStatus.todo },
        { id: 'in_progress', title: 'In Progress', color: 'blue', tasks: archivedTasksByStatus.in_progress },
        { id: 'done', title: 'Done', color: 'green', tasks: archivedTasksByStatus.done },
      ];
    }
    return [
      { id: 'todo', title: 'To Do', color: 'gray', tasks: kanban?.todo || [] },
      { id: 'in_progress', title: 'In Progress', color: 'blue', tasks: kanban?.in_progress || [] },
      { id: 'done', title: 'Done', color: 'green', tasks: kanban?.done || [] },
    ];
  }, [currentFilter, archivedTasksByStatus, kanban]);

  // Find the active task for DragOverlay - Memoized for performance
  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return lists.flatMap(list => list.tasks).find(t => t.id === activeId) || null;
  }, [activeId, lists]);

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" color="#4686FE" />
      </Center>
    );
  }

  return (
    <Box
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Filter Bar */}
      <TaskFilter
        currentFilter={currentFilter}
        onFilterChange={onFilterChange}
        taskCounts={taskCounts}
      />

      {/* Kanban Layout - same for all filters */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <Box
          style={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            marginLeft: '-4px',
            marginRight: '-4px',
            paddingLeft: '4px',
            paddingRight: '4px',
          }}
        >
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(280px, 1fr))',
            gap: '16px',
            paddingBottom: '24px',
            minWidth: '0',
          }}
        >
          {lists.map((list) => (
            <Box key={list.id}>
              <KanbanList
                id={list.id}
                title={list.title}
                color={list.color}
                tasks={list.tasks}
                onTaskClick={handleTaskClick}
                onAddTask={currentFilter === 'archived' ? undefined : (status) => {
                  setNewTaskStatus(status);
                  setCreateModalOpened(true);
                }}
                activeId={activeId}
                overId={overId}
                onToggleComplete={handleToggleComplete}
                onEditTask={handleTaskClick}
              />
            </Box>
          ))}
        </Box>
        </Box>

        {/* DragOverlay - Renders the dragged item on top of everything */}
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <KanbanCard task={activeTask} onClick={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Modal */}
      <TaskModal
        task={selectedTask}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onArchive={handleArchiveTask}
        onStartTimeTracking={(id) => startTrackingMutation.mutate(id)}
        onPauseTimeTracking={(id, trackingId) => pauseTrackingMutation.mutate({ id, trackingId })}
        onStopTimeTracking={(id, trackingId) => stopTrackingMutation.mutate({ id, trackingId })}
        onToggleChecklistItem={(id, checklistItemId) =>
          toggleChecklistMutation.mutate({ id, checklistItemId })
        }
      />

      {/* Create Task Modal */}
      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title={
          <Text
            style={{
              fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '20px',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            Create New Task
          </Text>
        }
        size="md"
        radius={16}
        styles={{
          content: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
        }}
      >
        <Stack gap="lg">
          <TextInput
            label="Title"
            placeholder="Task title"
            value={newTaskData.title}
            onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
            required
            withAsterisk
            size="md"
            radius={8}
            styles={{
              label: {
                fontFamily: 'Inter, sans-serif',
                color: '#000000',
                fontWeight: 600,
                marginBottom: 8,
                fontSize: '14px',
              },
              input: {
                fontFamily: 'Inter, sans-serif',
                backgroundColor: 'white',
                border: '1px solid #CCCCCC',
                color: '#000000',
                height: '48px',
                fontSize: '16px',
                '&::placeholder': {
                  color: '#999999',
                },
                '&:focus': {
                  borderColor: '#4686FE',
                  boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
                },
              },
            }}
          />

          <Select
            label="Life Area"
            placeholder="Select life area"
            value={newTaskData.lifeAreaId}
            onChange={(value) => setNewTaskData({ ...newTaskData, lifeAreaId: value || '' })}
            data={lifeAreas?.map((area) => ({ value: area.id, label: area.name })) || []}
            required
            withAsterisk
            searchable
            size="md"
            radius={8}
            styles={{
              label: {
                fontFamily: 'Inter, sans-serif',
                color: '#000000',
                fontWeight: 600,
                marginBottom: 8,
                fontSize: '14px',
              },
              input: {
                fontFamily: 'Inter, sans-serif',
                backgroundColor: 'white',
                border: '1px solid #CCCCCC',
                color: '#000000',
                height: '48px',
                fontSize: '16px',
                '&::placeholder': {
                  color: '#999999',
                },
                '&:focus': {
                  borderColor: '#4686FE',
                  boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
                },
              },
            }}
          />

          <Select
            label="Priority"
            value={newTaskData.priority}
            onChange={(value) => setNewTaskData({ ...newTaskData, priority: value as any })}
            data={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
            size="md"
            radius={8}
            styles={{
              label: {
                fontFamily: 'Inter, sans-serif',
                color: '#000000',
                fontWeight: 600,
                marginBottom: 8,
                fontSize: '14px',
              },
              input: {
                fontFamily: 'Inter, sans-serif',
                backgroundColor: 'white',
                border: '1px solid #CCCCCC',
                color: '#000000',
                height: '48px',
                fontSize: '16px',
                '&::placeholder': {
                  color: '#999999',
                },
                '&:focus': {
                  borderColor: '#4686FE',
                  boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
                },
              },
            }}
          />

          <Group justify="flex-end" mt="lg">
            <Button
              variant="outline"
              onClick={() => setCreateModalOpened(false)}
              radius={8}
              style={{
                fontFamily: 'Inter, sans-serif',
                borderColor: '#CCCCCC',
                color: '#333333',
                fontSize: '16px',
                fontWeight: 600,
                height: '48px',
                background: 'white',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4686FE',
                    color: '#4686FE',
                  },
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              loading={createMutation.isPending}
              radius={8}
              style={{
                fontFamily: 'Inter, sans-serif',
                background: '#4686FE',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: 'white',
                height: '48px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: '#3366E5',
                  },
                },
              }}
            >
              Create Task
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
