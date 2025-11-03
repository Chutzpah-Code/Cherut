'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Timer, TrendingUp } from 'lucide-react';
import {
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  SimpleGrid,
  Modal,
  TextInput,
  Textarea,
  Select,
  Badge,
  Loader,
  Center,
  Progress,
  NumberInput,
  useMantineColorScheme,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useKanbanBoard, useCreateTask, useUpdateTask, useDeleteTask, useIncrementPomodoro } from '@/hooks/useTasks';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useObjectives } from '@/hooks/useObjectives';
import { CreateTaskDto, Task } from '@/lib/api/services/tasks';

export default function TasksPage() {
  const { colorScheme } = useMantineColorScheme();
  const { data: kanban, isLoading } = useKanbanBoard();
  const { data: lifeAreas } = useLifeAreas();
  const { data: objectives } = useObjectives();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const pomodoroMutation = useIncrementPomodoro();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<CreateTaskDto>({
    lifeAreaId: '',
    title: '',
    description: '',
    priority: 'medium',
    estimatedPomodoros: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTask) {
        await updateMutation.mutateAsync({ id: editingTask.id, dto: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setIsModalOpen(false);
      setEditingTask(null);
      setFormData({
        lifeAreaId: '',
        title: '',
        description: '',
        priority: 'medium',
        estimatedPomodoros: 1,
      });
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      lifeAreaId: task.lifeAreaId,
      objectiveId: task.objectiveId,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate?.split('T')[0],
      estimatedPomodoros: task.estimatedPomodoros,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: 'Delete Task',
      children: <Text size="sm">Are you sure you want to delete this task? This action cannot be undone.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
        } catch (error) {
          console.error('Error deleting task:', error);
        }
      },
    });
  };

  const handleNew = () => {
    setEditingTask(null);
    setFormData({
      lifeAreaId: '',
      title: '',
      description: '',
      priority: 'medium',
      estimatedPomodoros: 1,
    });
    setIsModalOpen(true);
  };

  const handlePomodoro = async (taskId: string) => {
    try {
      await pomodoroMutation.mutateAsync(taskId);
    } catch (error) {
      console.error('Error incrementing pomodoro:', error);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: 'todo' | 'in_progress' | 'done') => {
    try {
      await updateMutation.mutateAsync({
        id: task.id,
        dto: { status: newStatus },
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getLifeAreaName = (lifeAreaId: string) => {
    return lifeAreas?.find((area) => area.id === lifeAreaId)?.name || 'Unknown';
  };

  const getObjectiveName = (objectiveId?: string) => {
    if (!objectiveId) return null;
    return objectives?.find((obj) => obj.id === objectiveId)?.title;
  };

  const getPriorityBadgeColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Cor de fundo da coluna baseada no tema
  const getColumnBgColor = () => {
    return colorScheme === 'dark' 
      ? 'var(--mantine-color-dark-8)' 
      : 'var(--mantine-color-gray-0)';
  };

  const renderTaskCard = (task: Task) => (
    <Card 
      key={task.id} 
      shadow="sm" 
      padding="md" 
      withBorder 
      style={{ 
        borderLeft: `4px solid var(--mantine-color-${getPriorityBadgeColor(task.priority)}-6)` 
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Group gap="xs" style={{ flex: 1 }}>
            <Badge color={getPriorityBadgeColor(task.priority)} size="sm" variant="light">
              {task.priority}
            </Badge>
            <Text fw={600} size="sm">{task.title}</Text>
          </Group>
        </Group>

        {task.description && (
          <Text size="xs" c="dimmed" lineClamp={2}>{task.description}</Text>
        )}

        <Stack gap="xs">
          <Group gap="xs">
            <TrendingUp size={14} />
            <Text size="xs" c="dimmed">{getLifeAreaName(task.lifeAreaId)}</Text>
          </Group>
          {task.objectiveId && (
            <Text size="xs" c="dimmed">
              Objective: {getObjectiveName(task.objectiveId)}
            </Text>
          )}
        </Stack>

        {/* Pomodoro Tracker */}
        {task.estimatedPomodoros && task.estimatedPomodoros > 0 && (
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" c="dimmed">Pomodoros</Text>
              <Text size="xs" c="dimmed">
                {task.completedPomodoros}/{task.estimatedPomodoros}
              </Text>
            </Group>
            <Progress
              value={(task.completedPomodoros / task.estimatedPomodoros) * 100}
              color="red"
              size="sm"
            />
          </Stack>
        )}

        {/* Action Buttons */}
        <Group gap="xs" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
          {task.estimatedPomodoros && task.completedPomodoros < task.estimatedPomodoros && (
            <Button
              size="xs"
              color="red"
              leftSection={<Timer size={14} />}
              onClick={() => handlePomodoro(task.id)}
              variant="filled"
            >
              +1
            </Button>
          )}
          <Button
            size="xs"
            variant="light"
            leftSection={<Edit2 size={14} />}
            onClick={() => handleEdit(task)}
          >
            Edit
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            leftSection={<Trash2 size={14} />}
            onClick={() => handleDelete(task.id)}
          >
            Delete
          </Button>
        </Group>

        {/* Status Change Buttons */}
        <Group gap="xs">
          {task.status !== 'todo' && (
            <Button
              size="xs"
              variant="light"
              color="gray"
              onClick={() => handleStatusChange(task, 'todo')}
              style={{ flex: 1 }}
            >
              To Do
            </Button>
          )}
          {task.status !== 'in_progress' && (
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => handleStatusChange(task, 'in_progress')}
              style={{ flex: 1 }}
            >
              In Progress
            </Button>
          )}
          {task.status !== 'done' && (
            <Button
              size="xs"
              variant="light"
              color="green"
              onClick={() => handleStatusChange(task, 'done')}
              style={{ flex: 1 }}
            >
              Done
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );

  if (isLoading) {
    return (
      <Center h={300}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1} size="h2" mb="xs">Tasks</Title>
          <Text c="dimmed" size="sm">Manage your tasks with Kanban board</Text>
        </div>
        <Button leftSection={<Plus size={20} />} onClick={handleNew}>
          New Task
        </Button>
      </Group>

      {/* Kanban Board */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {/* To Do Column */}
        <Card shadow="sm" padding="md" withBorder style={{ backgroundColor: getColumnBgColor() }}>
          <Group gap="xs" mb="md">
            <div style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-gray-6)', borderRadius: '50%' }}></div>
            <Text fw={600} size="lg">
              To Do ({kanban?.todo?.length || 0})
            </Text>
          </Group>
          <Stack gap="sm">
            {kanban?.todo?.map((task) => renderTaskCard(task))}
            {kanban?.todo?.length === 0 && (
              <Text c="dimmed" size="sm" ta="center" py="xl">No tasks</Text>
            )}
          </Stack>
        </Card>

        {/* In Progress Column */}
        <Card shadow="sm" padding="md" withBorder style={{ backgroundColor: getColumnBgColor() }}>
          <Group gap="xs" mb="md">
            <div style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-blue-6)', borderRadius: '50%' }}></div>
            <Text fw={600} size="lg">
              In Progress ({kanban?.in_progress?.length || 0})
            </Text>
          </Group>
          <Stack gap="sm">
            {kanban?.in_progress?.map((task) => renderTaskCard(task))}
            {kanban?.in_progress?.length === 0 && (
              <Text c="dimmed" size="sm" ta="center" py="xl">No tasks</Text>
            )}
          </Stack>
        </Card>

        {/* Done Column */}
        <Card shadow="sm" padding="md" withBorder style={{ backgroundColor: getColumnBgColor() }}>
          <Group gap="xs" mb="md">
            <div style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-green-6)', borderRadius: '50%' }}></div>
            <Text fw={600} size="lg">
              Done ({kanban?.done?.length || 0})
            </Text>
          </Group>
          <Stack gap="sm">
            {kanban?.done?.map((task) => renderTaskCard(task))}
            {kanban?.done?.length === 0 && (
              <Text c="dimmed" size="sm" ta="center" py="xl">No tasks</Text>
            )}
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Task' : 'New Task'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Select
              label="Life Area"
              placeholder="Select a life area"
              value={formData.lifeAreaId}
              onChange={(value) => setFormData({ ...formData, lifeAreaId: value || '' })}
              data={lifeAreas?.map((area) => ({ value: area.id, label: area.name })) || []}
              required
              withAsterisk
              searchable
            />

            <Select
              label="Objective (Optional)"
              placeholder="No objective"
              value={formData.objectiveId || null}
              onChange={(value) => setFormData({ ...formData, objectiveId: value || undefined })}
              data={objectives?.map((obj) => ({ value: obj.id, label: obj.title })) || []}
              searchable
              clearable
            />

            <TextInput
              label="Title"
              placeholder="e.g., Complete workout"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              withAsterisk
            />

            <Textarea
              label="Description"
              placeholder="Describe this task..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(value) => setFormData({ ...formData, priority: value as 'low' | 'medium' | 'high' })}
              data={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />

            <TextInput
              label="Due Date"
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />

            <NumberInput
              label="Estimated Pomodoros"
              placeholder="0 = no tracking"
              value={formData.estimatedPomodoros || ''}
              onChange={(value) => setFormData({ ...formData, estimatedPomodoros: typeof value === 'number' ? value : undefined })}
              min={0}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTask(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingTask ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}