'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Box, Checkbox, Group, Stack, Text } from '@mantine/core';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { RowsSkeleton } from './skeletons';

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#64748B',
};

export function TasksDuePanel() {
  const today = localToday();
  const { data: tasks = [], isLoading } = useTasks();
  const updateTask = useUpdateTask();

  const due = useMemo(() => {
    const startOfToday = new Date(`${today}T00:00:00`).getTime();
    return (tasks as any[])
      .filter((t) => t.dueDate && t.status !== 'done' && !t.archived && t.dueDate <= today)
      .map((t) => {
        const dueMs = new Date(`${t.dueDate}T00:00:00`).getTime();
        const daysOverdue = Math.floor((startOfToday - dueMs) / 86_400_000);
        return { ...t, daysOverdue };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [tasks, today]);

  return (
    <Box id="tasks-due" style={{ padding: '20px 24px' }}>
      <Group justify="space-between" mb={14}>
        <Text style={LABEL}>Tasks due</Text>
        <Link href="/dashboard/tasks" style={{ fontSize: 13, fontWeight: 500, color: '#0052CC', textDecoration: 'none' }}>
          View all tasks →
        </Link>
      </Group>

      {isLoading ? (
        <RowsSkeleton rows={3} />
      ) : due.length === 0 ? (
        <Text size="sm" c="dimmed">Nothing due. Clear day.</Text>
      ) : (
        <Stack gap={0}>
          {due.map((task, i) => {
            const overdue = task.daysOverdue > 0;
            return (
              <Group
                key={task.id}
                wrap="nowrap"
                gap={10}
                style={{
                  padding: '10px 0',
                  borderBottom: i < due.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <Checkbox
                  size="sm"
                  disabled={updateTask.isPending}
                  onChange={() => updateTask.mutate({ id: task.id, dto: { status: 'done' } })}
                  aria-label={`Mark "${task.title}" as done`}
                />
                <Text
                  size="sm"
                  fw={500}
                  style={{
                    color: '#0F172A', flex: 1, minWidth: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {task.title}
                </Text>
                <span style={{
                  fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 7px',
                  flexShrink: 0, letterSpacing: '0.03em',
                  background: overdue ? '#FEF2F2' : '#EFF6FF',
                  color: overdue ? '#B91C1C' : '#0052CC',
                }}>
                  {overdue ? `${task.daysOverdue}D OVERDUE` : 'TODAY'}
                </span>
              </Group>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
