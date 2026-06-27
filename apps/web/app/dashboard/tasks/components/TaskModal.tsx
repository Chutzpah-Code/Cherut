'use client';

import React from 'react';
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
  Switch,
  Tooltip,
} from '@mantine/core';
import { Plus, X, Play, Pause, Square, Trash2, Archive, Clock, RefreshCw } from 'lucide-react';
import { Task, ChecklistItem, UpdateTaskDto, RecurringConfig } from '@/lib/api/services/tasks';
import { useState, useEffect, useMemo } from 'react';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useObjectives } from '@/hooks/useObjectives';
import { useKeyResults } from '@/hooks/useKeyResults';
import { useTask, useUpdateTask, useToggleRecurringDate } from '@/hooks/useTasks';

function getRecurringDates(config: RecurringConfig): string[] {
  const dates: string[] = [];
  const current = new Date(config.startDate + 'T00:00:00');
  const end = new Date(config.endDate + 'T00:00:00');
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    if (config.frequency === 'daily') current.setDate(current.getDate() + 1);
    else if (config.frequency === 'weekly') current.setDate(current.getDate() + 7);
    else current.setMonth(current.getMonth() + 1);
  }
  return dates;
}

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
  const toggleRecurringDate = useToggleRecurringDate();

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
        isRecurring: currentTask.isRecurring ?? false,
        recurringConfig: currentTask.recurringConfig,
        completedDates: currentTask.completedDates,
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
    <React.Fragment>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text
          style={{
            fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '24px',
            fontWeight: 600,
            color: '#000000',
          }}
        >
          Edit Task
        </Text>
      }
      size="xl"
      radius={16}
      styles={{
        content: {
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        body: {
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '32px',
        },
        header: {
          padding: '24px 32px 0 32px',
          borderBottom: 'none',
        },
      }}
      overlayProps={{
        backgroundOpacity: 0.6,
        blur: 4,
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

        {/* Recurring */}
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Group gap={8}>
              <RefreshCw size={15} color="#4686FE" />
              <Text size="sm" fw={600}>Recurring task</Text>
            </Group>
            <Switch
              checked={!!formData.isRecurring}
              onChange={(e) => {
                const on = e.currentTarget.checked;
                setFormData({
                  ...formData,
                  isRecurring: on,
                  recurringConfig: on
                    ? (formData.recurringConfig ?? { startDate: '', endDate: '', frequency: 'daily' as const })
                    : undefined,
                  completedDates: on ? (formData.completedDates ?? []) : undefined,
                });
              }}
              color="blue"
            />
          </Group>

          {formData.isRecurring && (
            <Stack gap="sm" style={{ padding: '16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <Select
                label="Frequency"
                size="sm"
                value={formData.recurringConfig?.frequency ?? 'daily'}
                onChange={(v) => setFormData({
                  ...formData,
                  recurringConfig: { ...(formData.recurringConfig ?? { startDate: '', endDate: '' }), frequency: v as RecurringConfig['frequency'] },
                })}
                data={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
              />
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Start date"
                    type="date"
                    size="sm"
                    value={formData.recurringConfig?.startDate ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      recurringConfig: { ...(formData.recurringConfig ?? { endDate: '', frequency: 'daily' }), startDate: e.target.value },
                    })}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="End date"
                    type="date"
                    size="sm"
                    value={formData.recurringConfig?.endDate ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      recurringConfig: { ...(formData.recurringConfig ?? { startDate: '', frequency: 'daily' }), endDate: e.target.value },
                    })}
                  />
                </Grid.Col>
              </Grid>

              {/* Day-check grid — only for saved recurring tasks */}
              {currentTask.isRecurring && currentTask.recurringConfig?.startDate && currentTask.recurringConfig?.endDate && (() => {
                const allDates = getRecurringDates(currentTask.recurringConfig!);
                const completed = new Set(currentTask.completedDates ?? []);
                const total = allDates.length;
                const done = completed.size;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="xs" fw={600} c="dimmed">{done}/{total} days complete</Text>
                      <Text size="xs" c="dimmed">{pct}%</Text>
                    </Group>
                    <Progress value={pct} size="sm" radius={4} color={pct === 100 ? 'green' : 'blue'} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 140, overflowY: 'auto' }}>
                      {allDates.map((d) => {
                        const isDone = completed.has(d);
                        const label = d.slice(5); // MM-DD
                        return (
                          <Tooltip key={d} label={d} withArrow position="top">
                            <button
                              type="button"
                              onClick={() => toggleRecurringDate.mutate({ id: currentTask.id, date: d })}
                              style={{
                                width: 36, height: 36, borderRadius: 6, border: 'none',
                                background: isDone ? '#22C55E' : '#E2E8F0',
                                color: isDone ? '#fff' : '#64748B',
                                fontSize: 10, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.15s',
                              }}
                            >
                              {label}
                            </button>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </Stack>
                );
              })()}
            </Stack>
          )}
        </Stack>

        {/* Estimated Pomodoros */}
        <TextInput
          label="Estimated Pomodoros"
          type="number"
          min={0}
          placeholder="Number of pomodoros needed"
          value={formData.estimatedPomodoros ?? ''}
          onChange={(e) => setFormData({ ...formData, estimatedPomodoros: parseInt(e.target.value) || undefined })}
        />

        <Divider
          label={
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#666666',
              }}
            >
              Time Tracking
            </Text>
          }
          labelPosition="center"
          styles={{
            label: {
              backgroundColor: 'white',
              paddingLeft: '16px',
              paddingRight: '16px',
            },
          }}
        />

        {/* Time Tracking */}
        {currentTask.totalTimeTracked && currentTask.totalTimeTracked > 0 && (
          <Alert
            icon={<Clock size={16} />}
            variant="light"
            radius={8}
            styles={{
              root: {
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
              },
              icon: {
                color: '#4686FE',
              },
              message: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#334155',
              },
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#334155',
              }}
            >
              Total time tracked: {formatTime(currentTask.totalTimeTracked)}
            </Text>
          </Alert>
        )}

        <Grid>
          {!activeTracking ? (
            <Grid.Col span={{ base: 12, xs: 'content' }}>
              <Button
                leftSection={<Play size={16} />}
                color="green"
                onClick={() => onStartTimeTracking(currentTask.id)}
                fullWidth
              >
                Start Tracking
              </Button>
            </Grid.Col>
          ) : (
            <React.Fragment>
              <Grid.Col span={{ base: 6, xs: 'content' }}>
                <Button
                  leftSection={<Pause size={16} />}
                  color="yellow"
                  onClick={() => onPauseTimeTracking(currentTask.id, activeTracking.id)}
                  fullWidth
                >
                  Pause
                </Button>
              </Grid.Col>
              <Grid.Col span={{ base: 6, xs: 'content' }}>
                <Button
                  leftSection={<Square size={16} />}
                  color="red"
                  onClick={() => onStopTimeTracking(currentTask.id, activeTracking.id)}
                  fullWidth
                >
                  Stop
                </Button>
              </Grid.Col>
            </React.Fragment>
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
              radius={8}
              styles={{
                root: {
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                },
                section: {
                  backgroundColor: checklistProgress.percentage === 100 ? '#22C55E' : '#4686FE',
                },
              }}
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
                styles={{
                  input: {
                    borderColor: '#CCCCCC',
                    '&:checked': {
                      backgroundColor: '#4686FE',
                      borderColor: '#4686FE',
                    },
                  },
                }}
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
                variant="outline"
                onClick={() => handleRemoveChecklistItem(item.id)}
                styles={{
                  root: {
                    borderColor: '#CCCCCC',
                    color: '#666666',
                    '&:hover': {
                      borderColor: '#EF4444',
                      color: '#EF4444',
                      backgroundColor: '#FEF2F2',
                    },
                  },
                }}
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
                fullWidth
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
                fullWidth
              >
                Delete
              </Button>
            </Grid.Col>
          </Grid>

          <Grid justify="flex-end">
            <Grid.Col span={{ base: 6, sm: 'content' }}>
              <Button
                variant="outline"
                onClick={onClose}
                fullWidth
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
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 'content' }}>
              <Button
                onClick={handleSave}
                fullWidth
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
                Save Changes
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </Stack>
      </Modal>
    </React.Fragment>
  );
}
