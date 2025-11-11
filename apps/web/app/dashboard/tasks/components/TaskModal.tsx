'use client';

import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Stack,
  Badge,
  Checkbox,
  ActionIcon,
  Text,
  Divider,
  Progress,
  Alert,
  Grid,
} from '@mantine/core';
import { Plus, X, Play, Pause, Square, Trash2, Archive, Clock } from 'lucide-react';
import { Task, ChecklistItem, UpdateTaskDto } from '@/lib/api/services/tasks';
import { useState, useEffect } from 'react';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useObjectives } from '@/hooks/useObjectives';
import { useKeyResults } from '@/hooks/useKeyResults';
import { useTask, useUpdateTask } from '@/hooks/useTasks';

interface TaskModalProps {
  task: Task | null;
  opened: boolean;
  onClose: () => void;
  onSave: (id: string, updates: UpdateTaskDto) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onStartTimeTracking: (id: string) => void;
  onPauseTimeTracking: (id: string, trackingId: string) => void;
  onStopTimeTracking: (id: string, trackingId: string) => void;
  onToggleChecklistItem: (id: string, checklistItemId: string) => void;
}

export function TaskModal({
  task,
  opened,
  onClose,
  onSave,
  onDelete,
  onArchive,
  onStartTimeTracking,
  onPauseTimeTracking,
  onStopTimeTracking,
  onToggleChecklistItem,
}: TaskModalProps) {
  const { data: lifeAreas } = useLifeAreas();
  const { data: allObjectives } = useObjectives(undefined); // Get all objectives
  const { data: allKeyResults } = useKeyResults(undefined); // Get all key results

  // Fetch live data for the current task
  const { data: liveTask } = useTask(task?.id || '');

  // Use live task data if available, otherwise use prop task
  const currentTask = liveTask || task;

  // Use mutation for direct updates (checklist operations)
  const updateTaskMutation = useUpdateTask();

  const [formData, setFormData] = useState<UpdateTaskDto>({});
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Filter objectives by selected life area
  const filteredObjectives = allObjectives?.filter(
    (obj) => !formData.lifeAreaId || obj.lifeAreaId === formData.lifeAreaId
  );

  // Filter key results by selected objective
  const filteredKeyResults = allKeyResults?.filter(
    (kr) => !formData.objectiveId || kr.objectiveId === formData.objectiveId
  );

  useEffect(() => {
    if (currentTask) {
      setFormData({
        title: currentTask.title,
        description: currentTask.description,
        lifeAreaId: currentTask.lifeAreaId,
        objectiveId: currentTask.objectiveId,
        keyResultId: currentTask.keyResultId,
        priority: currentTask.priority,
        dueDate: currentTask.dueDate?.split('T')[0],
        estimatedPomodoros: currentTask.estimatedPomodoros,
        checklist: currentTask.checklist,
        tags: currentTask.tags,
      });
    }
  }, [currentTask]);

  if (!currentTask) return null;

  const activeTracking = currentTask.timeTracking?.find((t) => t.status === 'running');

  const handleSave = () => {
    onSave(currentTask.id, formData);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      title: newChecklistItem,
      completed: false,
    };

    const updatedChecklist = [...(currentTask.checklist || []), newItem];

    // Save immediately to backend without closing modal
    updateTaskMutation.mutate({
      id: currentTask.id,
      dto: { checklist: updatedChecklist },
    });

    setNewChecklistItem('');
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    const updatedChecklist = currentTask.checklist?.filter((item) => item.id !== itemId) || [];

    // Save immediately to backend without closing modal
    updateTaskMutation.mutate({
      id: currentTask.id,
      dto: { checklist: updatedChecklist },
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const checklistProgress = currentTask.checklist
    ? {
        completed: currentTask.checklist.filter((item) => item.completed).length,
        total: currentTask.checklist.length,
        percentage: Math.round(
          (currentTask.checklist.filter((item) => item.completed).length / currentTask.checklist.length) * 100
        ),
      }
    : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600} size="lg">Edit Task</Text>}
      size={{ base: 'full', xs: 'lg', sm: 'xl' }}
      fullScreen={{ base: true, xs: false }}
      styles={(theme) => ({
        content: {
          maxHeight: { base: '100vh', xs: 'calc(100vh - 120px)' },
        },
        body: {
          padding: { base: theme.spacing.xs, xs: theme.spacing.md },
          maxHeight: { base: 'calc(100vh - 60px)', xs: 'calc(100vh - 120px)' },
          overflowY: 'auto',
        },
        header: {
          padding: { base: theme.spacing.xs, xs: theme.spacing.md },
          borderBottom: `1px solid ${theme.colors.gray[2]}`,
        },
        title: {
          fontSize: { base: theme.fontSizes.md, xs: theme.fontSizes.lg },
          fontWeight: 600,
        },
      })}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="md">
        {/* Title */}
        <TextInput
          label="Title"
          placeholder="Task title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Task description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />

        {/* Life Area, Objective, Key Result */}
        <Stack gap="sm">
          <Grid grow>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Life Area"
                placeholder="Select life area"
                value={formData.lifeAreaId}
                onChange={(value) => {
                  // Clear objective and key result when life area changes
                  setFormData({
                    ...formData,
                    lifeAreaId: value || undefined,
                    objectiveId: undefined,
                    keyResultId: undefined
                  });
                }}
                data={lifeAreas?.map((area) => ({ value: area.id, label: area.name })) || []}
                searchable
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Objective (Optional)"
                placeholder="Link to objective"
                value={formData.objectiveId}
                onChange={(value) => {
                  // Clear key result when objective changes
                  setFormData({
                    ...formData,
                    objectiveId: value || undefined,
                    keyResultId: undefined
                  });
                }}
                data={filteredObjectives?.map((obj) => ({ value: obj.id, label: obj.title })) || []}
                searchable
                clearable
                disabled={!formData.lifeAreaId}
              />
            </Grid.Col>
          </Grid>
        </Stack>

        <Select
          label="Key Result (Optional)"
          placeholder="Link to key result"
          value={formData.keyResultId}
          onChange={(value) => setFormData({ ...formData, keyResultId: value || undefined })}
          data={filteredKeyResults?.map((kr) => ({ value: kr.id, label: kr.title })) || []}
          searchable
          clearable
          disabled={!formData.objectiveId}
        />

        {/* Priority and Due Date */}
        <Grid grow>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(value) => setFormData({ ...formData, priority: value as any })}
              data={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </Grid.Col>
        </Grid>

        {/* Estimated Pomodoros */}
        <TextInput
          label="Estimated Pomodoros"
          type="number"
          min={0}
          placeholder="Number of pomodoros needed"
          value={formData.estimatedPomodoros ?? ''}
          onChange={(e) => setFormData({ ...formData, estimatedPomodoros: parseInt(e.target.value) || undefined })}
        />

        <Divider label="Time Tracking" labelPosition="center" />

        {/* Time Tracking */}
        {currentTask.totalTimeTracked && currentTask.totalTimeTracked > 0 && (
          <Alert icon={<Clock size={16} />} color="violet" variant="light">
            Total time tracked: {formatTime(currentTask.totalTimeTracked)}
          </Alert>
        )}

        <Grid>
          {!activeTracking ? (
            <Grid.Col span={{ base: 12, xs: 'content' }}>
              <Button
                leftSection={<Play size={16} />}
                color="green"
                onClick={() => onStartTimeTracking(currentTask.id)}
                fullWidth={{ base: true, xs: false }}
              >
                Start Tracking
              </Button>
            </Grid.Col>
          ) : (
            <>
              <Grid.Col span={{ base: 6, xs: 'content' }}>
                <Button
                  leftSection={<Pause size={16} />}
                  color="yellow"
                  onClick={() => onPauseTimeTracking(currentTask.id, activeTracking.id)}
                  fullWidth={{ base: true, xs: false }}
                >
                  Pause
                </Button>
              </Grid.Col>
              <Grid.Col span={{ base: 6, xs: 'content' }}>
                <Button
                  leftSection={<Square size={16} />}
                  color="red"
                  onClick={() => onStopTimeTracking(currentTask.id, activeTracking.id)}
                  fullWidth={{ base: true, xs: false }}
                >
                  Stop
                </Button>
              </Grid.Col>
            </>
          )}
        </Grid>

        <Divider label="Checklist" labelPosition="center" />

        {/* Checklist */}
        {checklistProgress && (
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" fw={500}>Checklist Progress</Text>
              <Text size="sm" c="dimmed">{checklistProgress.completed}/{checklistProgress.total}</Text>
            </Group>
            <Progress
              value={checklistProgress.percentage}
              size="lg"
              color={checklistProgress.percentage === 100 ? 'green' : 'cyan'}
            />
          </Stack>
        )}

        <Stack gap="xs">
          {currentTask.checklist?.map((item) => (
            <Group key={item.id} gap="xs" wrap="nowrap">
              <Checkbox
                checked={item.completed}
                onChange={() => onToggleChecklistItem(currentTask.id, item.id)}
                style={{ flex: 0 }}
              />
              <Text
                size="sm"
                style={{
                  flex: 1,
                  textDecoration: item.completed ? 'line-through' : 'none',
                  opacity: item.completed ? 0.6 : 1,
                }}
              >
                {item.title}
              </Text>
              <ActionIcon
                size="sm"
                color="red"
                variant="subtle"
                onClick={() => handleRemoveChecklistItem(item.id)}
              >
                <X size={14} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>

        <Grid align="end">
          <Grid.Col span={{ base: 8, xs: 10 }}>
            <TextInput
              placeholder="Add checklist item"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 4, xs: 2 }}>
            <Button
              leftSection={<Plus size={16} />}
              onClick={handleAddChecklistItem}
              fullWidth
            >
              Add
            </Button>
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Actions */}
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 6, sm: 'content' }}>
              <Button
                leftSection={<Archive size={16} />}
                variant="light"
                color={currentTask.archived ? 'gray' : 'yellow'}
                onClick={() => onArchive(currentTask.id)}
                fullWidth={{ base: true, sm: false }}
              >
                {currentTask.archived ? 'Unarchive' : 'Archive'}
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 'content' }}>
              <Button
                leftSection={<Trash2 size={16} />}
                variant="light"
                color="red"
                onClick={() => {
                  onDelete(currentTask.id);
                  onClose();
                }}
                fullWidth={{ base: true, sm: false }}
              >
                Delete
              </Button>
            </Grid.Col>
          </Grid>

          <Grid justify="flex-end">
            <Grid.Col span={{ base: 6, sm: 'content' }}>
              <Button
                variant="light"
                onClick={onClose}
                fullWidth={{ base: true, sm: false }}
              >
                Cancel
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 'content' }}>
              <Button
                onClick={handleSave}
                fullWidth={{ base: true, sm: false }}
              >
                Save Changes
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </Stack>
    </Modal>
  );
}
