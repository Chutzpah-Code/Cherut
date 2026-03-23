'use client';

import React from 'react';
import { Card, Text, Badge, Group, Stack, ActionIcon, Progress, Tooltip } from '@mantine/core';
import { Target, CheckSquare, Clock, Archive } from 'lucide-react';
import { Task } from '@/lib/api/services/tasks';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useMemo } from 'react';

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
  onToggleComplete?: (taskId: string) => void;
}

export const KanbanCard = memo(function KanbanCard({ task, onClick, onToggleComplete }: KanbanCardProps) {
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
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
    opacity: isDragging ? 0 : 1,
    willChange: 'transform', // Enables hardware acceleration
  };

  const priorityColor = useMemo(() => {
    switch (task.priority) {
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
  }, [task.priority]);

  const daysUntilDue = useMemo(() => {
    if (!task.dueDate) return null;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [task.dueDate]);

  const dueDateBadge = useMemo(() => {
    if (daysUntilDue === null) return null;

    if (daysUntilDue < 0) {
      return (
        <Badge color="red" size="xs" variant="filled">
          Overdue ({Math.abs(daysUntilDue)}d)
        </Badge>
      );
    } else if (daysUntilDue === 0) {
      return (
        <Badge color="orange" size="xs" variant="filled">
          Today
        </Badge>
      );
    } else if (daysUntilDue <= 3) {
      return (
        <Badge color="yellow" size="xs" variant="filled">
          {daysUntilDue}d left
        </Badge>
      );
    } else if (daysUntilDue <= 7) {
      return (
        <Badge color="blue" size="xs" variant="light">
          {daysUntilDue}d
        </Badge>
      );
    }
    return (
      <Badge color="gray" size="xs" variant="light">
        {daysUntilDue}d
      </Badge>
    );
  }, [daysUntilDue]);

  const checklistProgress = useMemo(() => {
    if (!task.checklist || task.checklist.length === 0) return null;
    const completed = task.checklist.filter((item) => item.completed).length;
    const total = task.checklist.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  }, [task.checklist]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const hasActiveTimeTracking = useMemo(() =>
    task.timeTracking?.some((t) => t.status === 'running'),
    [task.timeTracking]
  );

  return (
    <React.Fragment>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Card
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: 'none',
        borderLeft: `4px solid var(--mantine-color-${priorityColor}-6)`,
        transition: isDragging ? 'none' : 'all 0.2s ease',
        backgroundColor: task.archived ? 'var(--mantine-color-gray-1)' : (isDragging ? '#f8f9fa' : undefined),
        opacity: isDragging ? 0.8 : (task.archived ? 0.7 : 1),
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: isDragging ? 'translate3d(0, 0, 0) rotate(3deg) scale(1.02)' : 'translate3d(0, 0, 0)',
        boxShadow: isDragging
          ? '0 8px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(70,134,254,0.3)'
          : undefined,
        zIndex: isDragging ? 1000 : 'auto',
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
        {/* Header with optional badges */}
        <Group justify="flex-end" gap="xs" wrap="nowrap">
          {task.archived && (
            <Badge
              size="sm"
              variant="light"
              color="gray"
              radius={6}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 500,
                backgroundColor: '#F3F4F6',
                color: '#6B7280',
              }}
            >
              Archived
            </Badge>
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

        {/* Title with checkbox */}
        <Group gap="xs" align="flex-start" wrap="nowrap">
          {/* Task completion checkbox */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleComplete) {
                onToggleComplete(task.id);
              }
            }}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid var(--mantine-color-${priorityColor}-6)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              marginTop: '2px',
              backgroundColor: task.status === 'done' ? `var(--mantine-color-green-6)` : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {task.status === 'done' && (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                }}
              />
            )}
          </div>

          <Text fw={600} size="sm" lineClamp={2} style={{ wordBreak: 'break-word', flex: 1 }}>
            {task.title}
          </Text>
        </Group>

        {/* Description */}
        {task.description && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {task.description}
          </Text>
        )}

        {/* Metadata badges */}
        <Group gap="sm" wrap="wrap" style={{ marginTop: '4px' }}>
          {dueDateBadge}

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
    </React.Fragment>
  );
});
