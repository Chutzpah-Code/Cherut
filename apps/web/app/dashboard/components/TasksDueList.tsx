'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Box, Group, Stack, Text } from '@mantine/core';
import { useTasks } from '@/hooks/useTasks';
import { RowsSkeleton } from './skeletons';

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const LABEL: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#0F172A' };

export function TasksDueList() {
  const today = localToday();
  const { data: tasks = [], isLoading } = useTasks();

  const { due, totalOpen, oldestOpenDays } = useMemo(() => {
    const startOfToday = new Date(`${today}T00:00:00`).getTime();
    const open = (tasks as any[]).filter((t) => t.status !== 'done' && !t.archived);
    let oldest = 0;
    for (const t of open) {
      if (!t.dueDate) continue;
      const days = Math.floor((startOfToday - new Date(`${t.dueDate}T00:00:00`).getTime()) / 86_400_000);
      if (days > oldest) oldest = days;
    }
    const dueList = open
      .filter((t) => t.dueDate && t.dueDate <= today)
      .map((t) => {
        const dueMs = new Date(`${t.dueDate}T00:00:00`).getTime();
        return { ...t, daysOverdue: Math.floor((startOfToday - dueMs) / 86_400_000) };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
    return { due: dueList, totalOpen: open.length, oldestOpenDays: oldest };
  }, [tasks, today]);

  return (
    <Box id="tasks-due" style={{ padding: '24px 28px 26px' }}>
      <Group justify="space-between" align="baseline">
        <Text style={LABEL}>Tasks due</Text>
        <Link href="/dashboard/tasks" style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', textDecoration: 'none' }}>All tasks</Link>
      </Group>
      <Text style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 14px' }}>Sorted by how late they are</Text>

      {isLoading ? (
        <RowsSkeleton rows={4} />
      ) : due.length === 0 ? (
        <Text size="sm" c="dimmed">Nothing due. Clear day.</Text>
      ) : (
        <Stack gap={1}>
          {due.map((task) => {
            const overdue = task.daysOverdue > 0;
            return (
              <Box
                key={task.id}
                style={{
                  display: 'grid', gridTemplateColumns: '30px minmax(0,1fr) auto', alignItems: 'center', gap: 14,
                  padding: '11px 12px', borderRadius: 6,
                  background: overdue ? '#FEF2F2' : '#F8FAFC',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: 700, color: overdue ? '#B91C1C' : '#1D4ED8', fontVariantNumeric: 'tabular-nums' }}>
                  {overdue ? `${task.daysOverdue}d` : '—'}
                </Text>
                <Text style={{ fontSize: 14.5, fontWeight: 500, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {task.title}
                </Text>
                <Text style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', color: overdue ? '#B91C1C' : '#1D4ED8', whiteSpace: 'nowrap' }}>
                  {overdue ? 'OVERDUE' : 'TODAY'}
                </Text>
              </Box>
            );
          })}
        </Stack>
      )}

      <Group justify="space-between" mt={14} pt={14} style={{ borderTop: '1px solid #EFF1F5' }}>
        <Text style={{ fontSize: 12.5, color: '#64748B' }}>{due.length} of {totalOpen} open tasks</Text>
        <Text style={{ fontSize: 12.5, color: '#64748B' }}>Oldest open: {oldestOpenDays} day{oldestOpenDays !== 1 ? 's' : ''}</Text>
      </Group>
    </Box>
  );
}
