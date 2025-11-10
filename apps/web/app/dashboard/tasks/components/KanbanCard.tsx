'use client';

import { Card, Text, Badge, Group, Stack, ActionIcon, Progress, Tooltip } from '@mantine/core';
import { GripVertical, Target, CheckSquare, Clock, Archive } from 'lucide-react';
import { Task } from '@/lib/api/services/tasks';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
}

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getDaysUntilDue = () => {
    if (!task.dueDate) return null;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateBadge = () => {
    const days = getDaysUntilDue();
    if (days === null) return null;

    if (days < 0) {
      return (
        <Badge color="red" size="xs" variant="filled">
          Overdue ({Math.abs(days)}d)
        </Badge>
      );
    } else if (days === 0) {
      return (
        <Badge color="orange" size="xs" variant="filled">
          Today
        </Badge>
      );
    } else if (days <= 3) {
      return (
        <Badge color="yellow" size="xs" variant="filled">
          {days}d left
        </Badge>
      );
    } else if (days <= 7) {
      return (
        <Badge color="blue" size="xs" variant="light">
          {days}d
        </Badge>
      );
    }
    return (
      <Badge color="gray" size="xs" variant="light">
        {days}d
      </Badge>
    );
  };

  const getChecklistProgress = () => {
    if (!task.checklist || task.checklist.length === 0) return null;
    const completed = task.checklist.filter((item) => item.completed).length;
    const total = task.checklist.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  const checklistProgress = getChecklistProgress();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const hasActiveTimeTracking = task.timeTracking?.some((t) => t.status === 'running');

  const priorityColor = getPriorityColor(task.priority);

  return (
    <Card
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: 'none',
        borderLeft: `4px solid var(--mantine-color-${priorityColor}-6)`,
        transition: isDragging ? 'none' : 'all 0.2s ease',
        backgroundColor: task.archived ? 'var(--mantine-color-gray-1)' : undefined,
        opacity: isDragging ? 0 : (task.archived ? 0.7 : 1),
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <Stack gap="xs">
        {/* Header with grip and priority */}
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <Group gap="xs" style={{ flex: 1 }} wrap="nowrap">
            {/* Drag Handle - Visual indicator only, entire card is draggable */}
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              style={{ cursor: 'grab', touchAction: 'none', pointerEvents: 'none' }}
            >
              <GripVertical size={16} />
            </ActionIcon>

            <Badge color={getPriorityColor(task.priority)} size="xs" variant="light">
              {task.priority}
            </Badge>

            {task.archived && (
              <Tooltip label="Archived">
                <Archive size={14} color="gray" />
              </Tooltip>
            )}

            {hasActiveTimeTracking && (
              <Tooltip label="Time tracking active">
                <Clock
                  size={14}
                  color="red"
                  style={{
                    animation: 'pulse 2s infinite',
                  }}
                />
              </Tooltip>
            )}
          </Group>
        </Group>

        {/* Title */}
        <Text fw={600} size="sm" lineClamp={2} style={{ wordBreak: 'break-word' }}>
          {task.title}
        </Text>

        {/* Description */}
        {task.description && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {task.description}
          </Text>
        )}

        {/* Metadata badges */}
        <Group gap="sm" wrap="wrap" style={{ marginTop: '4px' }}>
          {getDueDateBadge()}

          {task.objectiveId && !task.keyResultId && (
            <Tooltip label="Linked to Objective">
              <Badge leftSection={<Target size={12} />} size="sm" variant="dot" color="blue">
                Objective
              </Badge>
            </Tooltip>
          )}

          {task.keyResultId && (
            <Tooltip label="Linked to Key Result">
              <Badge leftSection={<Target size={12} />} size="sm" variant="filled" color="blue">
                Key Result
              </Badge>
            </Tooltip>
          )}

          {checklistProgress && (
            <Tooltip label={`${checklistProgress.completed}/${checklistProgress.total} completed`}>
              <Badge leftSection={<CheckSquare size={12} />} size="sm" variant="dot" color="cyan">
                {checklistProgress.completed}/{checklistProgress.total}
              </Badge>
            </Tooltip>
          )}

          {task.totalTimeTracked && task.totalTimeTracked > 0 && (
            <Tooltip label="Total time tracked">
              <Badge leftSection={<Clock size={12} />} size="sm" variant="dot" color="violet">
                {formatTime(task.totalTimeTracked)}
              </Badge>
            </Tooltip>
          )}

          {task.tags && task.tags.length > 0 && (
            <Badge size="sm" variant="outline" color="gray">
              {task.tags[0]}
              {task.tags.length > 1 && ` +${task.tags.length - 1}`}
            </Badge>
          )}
        </Group>

        {/* Checklist Progress Bar */}
        {checklistProgress && (
          <Progress
            value={checklistProgress.percentage}
            size="xs"
            color={checklistProgress.percentage === 100 ? 'green' : 'cyan'}
          />
        )}

        {/* Pomodoro Progress */}
        {task.estimatedPomodoros && task.estimatedPomodoros > 0 && (
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">
              Pomodoros: {task.completedPomodoros}/{task.estimatedPomodoros}
            </Text>
            <Progress
              value={(task.completedPomodoros / task.estimatedPomodoros) * 100}
              size="xs"
              color="red"
              style={{ flex: 1 }}
            />
          </Group>
        )}
      </Stack>

      {/* Global styles for pulse animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `
      }} />
    </Card>
  );
}
