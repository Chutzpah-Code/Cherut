'use client';

import React, { useState } from 'react';
import { Card, Text, Group, Stack, Badge, Tooltip, ActionIcon } from '@mantine/core';
import { Clock, Archive, Edit2, RefreshCw } from 'lucide-react';
import { Task } from '@/lib/api/services/tasks';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useMemo } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
  onToggleComplete?: (taskId: string) => void;
  onEdit?: () => void;
}

export const KanbanCard = memo(function KanbanCard({ task, onClick, onToggleComplete, onEdit }: KanbanCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches);
  const colors = useThemeColors();
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
    willChange: 'transform',
    touchAction: 'none' as const,
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


  const hasActiveTimeTracking = useMemo(() =>
    task.timeTracking?.some((t) => t.status === 'running'),
    [task.timeTracking]
  );

  const recurringProgress = useMemo(() => {
    if (!task.isRecurring || !task.recurringConfig?.startDate || !task.recurringConfig?.endDate) return null;
    const { startDate, endDate, frequency } = task.recurringConfig;
    let total = 0;
    const cur = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    while (cur <= end) {
      total++;
      if (frequency === 'daily') cur.setDate(cur.getDate() + 1);
      else if (frequency === 'weekly') cur.setDate(cur.getDate() + 7);
      else cur.setMonth(cur.getMonth() + 1);
    }
    const done = task.completedDates?.length ?? 0;
    return { done, total };
  }, [task.isRecurring, task.recurringConfig, task.completedDates]);

  return (
    <React.Fragment>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Card
      ref={setNodeRef}
      style={{
        ...style,
        borderLeft: `4px solid var(--mantine-color-${priorityColor}-6)`,
        transition: isDragging ? 'none' : 'all 0.2s ease',
        backgroundColor: task.archived ? colors.surface : (isDragging ? colors.hover : colors.surfaceElevated),
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...attributes}
      {...listeners}
    >
      <Stack gap="xs">
        {/* Archived badge - only show if task is archived */}
        {task.archived && (
          <Group justify="flex-end">
            <Badge
              size="sm"
              variant="light"
              color="gray"
              radius={6}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 500,
                backgroundColor: colors.surface,
                color: colors.text.secondary,
              }}
            >
              Archived
            </Badge>
          </Group>
        )}

        {/* Title with checkbox and edit button */}
        <Group gap="xs" align="flex-start" wrap="nowrap" justify="space-between">
          {/* Left side: checkbox and title */}
          <Group gap="xs" align="flex-start" wrap="nowrap" style={{ flex: 1 }}>
            {/* Task completion checkbox */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleComplete) {
                  onToggleComplete(task.id);
                }
              }}
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                marginTop: '-10px',
                marginLeft: '-12px',
                marginBottom: '-10px',
              }}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `2px solid var(--mantine-color-${priorityColor}-6)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: task.status === 'done' ? `var(--mantine-color-green-6)` : 'transparent',
                transition: 'all 0.2s ease',
              }}>
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
            </div>

            <Text fw={400} size="sm" lineClamp={2} style={{ wordBreak: 'break-word', flex: 1 }}>
              {task.title.length > 50 ? `${task.title.substring(0, 50)}...` : task.title}
            </Text>
          </Group>

          {/* Right side: edit button — always visible on touch, hover-only on desktop */}
          {onEdit && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size={isTouchDevice ? 36 : 24}
              radius={6}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={{
                opacity: isTouchDevice || isHovered ? 1 : 0,
                visibility: isTouchDevice || isHovered ? 'visible' : 'hidden',
                transition: 'all 0.15s ease',
                color: colors.primary,
                flexShrink: 0,
                marginTop: '2px',
                minWidth: isTouchDevice ? '44px' : undefined,
                minHeight: isTouchDevice ? '44px' : undefined,
              }}
            >
              <Edit2 size={isTouchDevice ? 16 : 12} />
            </ActionIcon>
          )}
        </Group>
        {/* Recurring progress */}
        {recurringProgress && (
          <Group gap={6} mt={2}>
            <RefreshCw size={11} color="#4686FE" />
            <Text size="xs" c="dimmed" fw={500}>
              {recurringProgress.done}/{recurringProgress.total}
            </Text>
            <div style={{ flex: 1, height: 3, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${recurringProgress.total > 0 ? (recurringProgress.done / recurringProgress.total) * 100 : 0}%`,
                background: recurringProgress.done === recurringProgress.total ? '#22C55E' : '#4686FE',
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }} />
            </div>
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
    </React.Fragment>
  );
});
