'use client';

import Link from 'next/link';
import { Box, Group, Stack, Text } from '@mantine/core';
import { CheckCircle2, Circle } from 'lucide-react';
import { useTodayHabits, useLogHabit } from '@/hooks/useHabits';
import { RowsSkeleton } from './skeletons';

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

  const loggedCount = items.filter((i) => i.loggedToday).length;

  const handleToggle = (habitId: string, loggedToday: boolean) => {
    logMutation.mutate({ habitId, date: today, completed: !loggedToday });
  };

  return (
    <Box style={{ padding: '20px 24px' }}>
      <Group justify="space-between" mb={14}>
        <Text style={LABEL}>Today's habits</Text>
        <Group gap={12}>
          {items.length > 0 && (
            <Text size="xs" c="dimmed" fw={600}>{loggedCount} / {items.length}</Text>
          )}
          <Link href="/dashboard/habits" style={{ fontSize: 13, fontWeight: 500, color: '#0052CC', textDecoration: 'none' }}>
            View all habits →
          </Link>
        </Group>
      </Group>

      {isLoading ? (
        <RowsSkeleton rows={3} />
      ) : items.length === 0 ? (
        <Text size="sm" c="dimmed">No habits scheduled today.</Text>
      ) : (
        <Stack gap={0}>
          {items.map(({ habit, loggedToday }, i) => {
            const isPending = logMutation.isPending && (logMutation.variables as any)?.habitId === habit.id;
            return (
              <Group
                key={habit.id}
                justify="space-between"
                wrap="nowrap"
                style={{
                  padding: '8px 0',
                  borderBottom: i < items.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <Group gap={8} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => handleToggle(habit.id, loggedToday)}
                    disabled={isPending}
                    style={{
                      background: 'none', border: 'none', cursor: isPending ? 'default' : 'pointer',
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
                {habit.streak > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', flexShrink: 0 }}>
                    {habit.streak}d streak
                  </span>
                )}
              </Group>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
