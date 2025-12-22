'use client';

import { useState } from 'react';
import { Box, Loader, Center, Group, Button, Modal, TextInput, Stack, Select } from '@mantine/core';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
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
import { ArchivedTasksGrid } from './ArchivedTasksGrid';

interface KanbanViewProps {
  currentFilter: TaskFilterType;
  onFilterChange: (filter: TaskFilterType) => void;
}

export function KanbanView({ currentFilter, onFilterChange }: KanbanViewProps) {
  const { data: kanban, isLoading: kanbanLoading } = useKanbanBoard(undefined, currentFilter === 'all');
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    console.log('Drag End:', { activeId: active.id, overId: over?.id });

    if (!over) {
      console.log('No drop target detected');
      return;
    }

    const taskId = active.id as string;
    const overId = over.id as string;

    // Find the source task
    const activeTask = kanban?.todo.find(t => t.id === taskId)
      || kanban?.in_progress.find(t => t.id === taskId)
      || kanban?.done.find(t => t.id === taskId);

    if (!activeTask) {
      console.log('Active task not found');
      return;
    }

    // Find which column the task is being dropped into
    let targetStatus: 'todo' | 'in_progress' | 'done' | null = null;
    let overTask: Task | undefined = undefined;

    // Check if overId is a column
    if (['todo', 'in_progress', 'done'].includes(overId)) {
      targetStatus = overId as 'todo' | 'in_progress' | 'done';
      console.log('Dropped on column:', targetStatus);
    } else {
      // overId is a task, find which column that task belongs to
      overTask = kanban?.todo.find(t => t.id === overId)
        || kanban?.in_progress.find(t => t.id === overId)
        || kanban?.done.find(t => t.id === overId);

      if (overTask) {
        targetStatus = overTask.status;
        console.log('Dropped on task in column:', targetStatus);
      }
    }

    if (!targetStatus) {
      console.log('Could not determine target status');
      return;
    }

    // If moving to a different column
    if (targetStatus !== activeTask.status) {
      console.log('Moving task from', activeTask.status, 'to', targetStatus);
      const targetColumnTasks = kanban?.[targetStatus] || [];
      const newOrder = overTask ? overTask.order : (targetColumnTasks.length > 0 ? Math.max(...targetColumnTasks.map(t => t.order)) + 1 : 0);

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
      console.log('Reordering within same column');
      const currentColumnTasks = kanban?.[targetStatus] || [];
      const oldIndex = currentColumnTasks.findIndex(t => t.id === taskId);
      const newIndex = currentColumnTasks.findIndex(t => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        console.log('Moving from index', oldIndex, 'to', newIndex);

        // Reorder the array locally
        const reorderedTasks = arrayMove(currentColumnTasks, oldIndex, newIndex);

        // Update ALL tasks in the column with new order values
        // This ensures proper ordering when the data reloads
        reorderedTasks.forEach((task, index) => {
          // Update each task's order in the backend
          updateOrderMutation.mutate({
            id: task.id,
            dto: {
              newStatus: targetStatus,
              newOrder: index,
            },
          });
        });
      }
    } else {
      console.log('No change needed');
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setModalOpened(true);
  };

  const handleSaveTask = (id: string, updates: UpdateTaskDto) => {
    updateMutation.mutate({ id, dto: updates });
    setModalOpened(false);
  };

  const handleDeleteTask = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleArchiveTask = (id: string) => {
    archiveMutation.mutate(id);
  };

  const handleUnarchiveTask = (task: Task) => {
    archiveMutation.mutate(task.id);
  };

  const handleCreateTask = () => {
    if (!newTaskData.title || !newTaskData.lifeAreaId) return;

    // Create task and then update its status if needed
    createMutation.mutate(newTaskData, {
      onSuccess: (task) => {
        // If the status is not 'todo', update it
        if (newTaskStatus !== 'todo') {
          updateOrderMutation.mutate({
            id: task.id,
            dto: {
              newStatus: newTaskStatus as 'todo' | 'in_progress' | 'done',
              newOrder: 0,
            },
          });
        }
      },
    });

    setNewTaskData({ title: '', lifeAreaId: '', priority: 'medium' });
    setCreateModalOpened(false);
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  const lists = [
    { id: 'todo', title: 'To Do', color: 'gray', tasks: kanban?.todo || [] },
    { id: 'in_progress', title: 'In Progress', color: 'blue', tasks: kanban?.in_progress || [] },
    { id: 'done', title: 'Done', color: 'green', tasks: kanban?.done || [] },
  ];

  // Find the active task for DragOverlay
  const activeTask = activeId
    ? kanban?.todo.find(t => t.id === activeId) ||
      kanban?.in_progress.find(t => t.id === activeId) ||
      kanban?.done.find(t => t.id === activeId)
    : null;

  return (
    <>
      {/* Filter Bar */}
      <TaskFilter
        currentFilter={currentFilter}
        onFilterChange={onFilterChange}
        taskCounts={taskCounts}
      />

      {/* Conditional Content Based on Filter */}
      {currentFilter === 'archived' ? (
        <ArchivedTasksGrid
          tasks={archivedTasks || []}
          onUnarchive={handleUnarchiveTask}
          onDelete={handleDeleteTask}
          onView={handleTaskClick}
        />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
        >
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
              paddingBottom: '80px',
              minHeight: '600px',
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
                  onAddTask={(status) => {
                    setNewTaskStatus(status);
                    setCreateModalOpened(true);
                  }}
                />
              </Box>
            ))}
          </Box>

          {/* DragOverlay - Renders the dragged item on top of everything */}
          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <KanbanCard task={activeTask} onClick={() => {}} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

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
        title="Create New Task"
      >
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Task title"
            value={newTaskData.title}
            onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
            required
          />

          <Select
            label="Life Area"
            placeholder="Select life area"
            value={newTaskData.lifeAreaId}
            onChange={(value) => setNewTaskData({ ...newTaskData, lifeAreaId: value || '' })}
            data={lifeAreas?.map((area) => ({ value: area.id, label: area.name })) || []}
            required
            searchable
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
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setCreateModalOpened(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} loading={createMutation.isPending}>
              Create Task
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
