'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Group, Stack, Text, Menu, ActionIcon } from '@mantine/core';
import { CheckCircle2, Circle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useTodayHabits, useLogHabit, useDeleteHabit } from '@/hooks/useHabits';
import { RowsSkeleton } from './skeletons';
import { useUndoableDelete } from './useUndoableDelete';
import { useRowKeyNav } from './useRowKeyNav';

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#64748B',
};

export function TodaysHabitsPanel() {
  const today = localToday();
  const { data: items = [], isLoading } = useTodayHabits(today);
  const logMutation = useLogHabit();
  const deleteHabit = useDeleteHabit();
  const undoableDelete = useUndoableDelete<string>((id) => deleteHabit.mutate(id), { label: 'Habit' });
  const { containerRef, onKeyDown } = useRowKeyNav<HTMLDivElement>();
  // Local optimistic overrides so the toggle feels instant — reconciled once
  // the mutation settles and the query refetches with the real server state.
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});

  const resolved = items
    .filter((item) => !undoableDelete.isPending(item.habit.id))
    .map((item) => ({
      ...item,
      loggedToday: optimistic[item.habit.id] ?? item.loggedToday,
    }));
  const loggedCount = resolved.filter((i) => i.loggedToday).length;

  const handleToggle = (habitId: string, loggedToday: boolean) => {
    setOptimistic((prev) => ({ ...prev, [habitId]: !loggedToday }));
    logMutation.mutate(
      { habitId, date: today, completed: !loggedToday },
      {
        onError: () => setOptimistic((prev) => ({ ...prev, [habitId]: loggedToday })),
        onSettled: () => setOptimistic((prev) => {
          const next = { ...prev };
          delete next[habitId];
          return next;
        }),
      },
    );
  };

  return (
    <Box id="today-habits" style={{ padding: '20px 24px' }}>
      <Group justify="space-between" mb={14}>
        <Text style={LABEL}>Today's habits</Text>
        <Group gap={12}>
          {resolved.length > 0 && (
            <Text size="xs" fw={600}>
              {loggedCount}<span style={{ color: '#94A3B8' }}> / {resolved.length}</span>
            </Text>
          )}
          <Link href="/dashboard/habits" style={{ fontSize: 13, fontWeight: 500, color: '#0052CC', textDecoration: 'none' }}>
            View all habits →
          </Link>
        </Group>
      </Group>

      {isLoading ? (
        <RowsSkeleton rows={3} />
      ) : resolved.length === 0 ? (
        <Text size="sm" c="dimmed">No habits scheduled today.</Text>
      ) : (
        <Stack gap={0} ref={containerRef} onKeyDown={onKeyDown}>
          {resolved.map(({ habit, loggedToday }, i) => {
            return (
              <Group
                key={habit.id}
                justify="space-between"
                wrap="nowrap"
                style={{
                  padding: '8px 0',
                  borderBottom: i < resolved.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <Group gap={8} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <button
                    data-row-nav
                    onClick={() => handleToggle(habit.id, loggedToday)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 13, margin: -13, flexShrink: 0, display: 'flex', alignItems: 'center',
                    }}
                    aria-label={loggedToday ? `Undo "${habit.title}"` : `Log "${habit.title}"`}
                  >
                    {loggedToday
                      ? <CheckCircle2 size={18} color="#16A34A" strokeWidth={1.8} />
                      : <Circle size={18} color="#CBD5E1" strokeWidth={1.8} />
                    }
                  </button>
                  <Text
                    size="sm"
                    fw={500}
                    style={{
                      color: loggedToday ? '#94A3B8' : '#0F172A',
                      textDecoration: loggedToday ? 'line-through' : 'none',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {habit.title}
                  </Text>
                  {habit.targetValue && habit.unit && (
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: '#64748B',
                      background: '#F1F5F9', borderRadius: 4, padding: '2px 6px', flexShrink: 0,
                    }}>
                      {habit.targetValue} {habit.unit}
                    </span>
                  )}
                </Group>
                <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
                  {habit.streak > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>
                      {habit.streak}d streak
                    </span>
                  )}
                  <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                      <ActionIcon variant="subtle" size="sm" aria-label={`Actions for "${habit.title}"`}>
                        <MoreHorizontal size={16} color="#64748B" />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item component={Link} href="/dashboard/habits" leftSection={<Pencil size={14} />}>
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        leftSection={<Trash2 size={14} />}
                        onClick={() => undoableDelete.remove(habit.id)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
