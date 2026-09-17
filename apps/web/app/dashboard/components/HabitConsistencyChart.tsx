'use client';

import Link from 'next/link';
import { Box, Group, Stack, Text } from '@mantine/core';
import { useHabitConsistency, useTodayHabits } from '@/hooks/useHabits';
import { RowsSkeleton } from './skeletons';

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const LABEL: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#0F172A' };

export function HabitConsistencyChart() {
  const { data, isLoading } = useHabitConsistency(13);
  const { data: todayHabits = [] } = useTodayHabits(localToday());
  const habits = data?.habits ?? [];
  const loggedToday = todayHabits.filter((h) => h.loggedToday).length;

  return (
    <Box style={{ padding: '24px 28px 26px' }}>
      <Group justify="space-between" align="baseline">
        <Text style={LABEL}>Habit consistency</Text>
        <Link href="/dashboard/habits" style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', textDecoration: 'none' }}>Habits</Link>
      </Group>
      <Text style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 18px' }}>
        From habit logs · last 13 days{data?.overallPct != null ? ` · ${data.overallPct}% overall` : ''}
      </Text>

      {isLoading ? (
        <RowsSkeleton rows={4} height={22} />
      ) : habits.length === 0 ? (
        <Text size="sm" c="dimmed">No active habits.</Text>
      ) : (
        <>
          <Stack gap={13}>
            {habits.map((habit) => (
              <Box
                key={habit.habitId}
                style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto 44px', alignItems: 'center', gap: 14 }}
              >
                <Text
                  style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {habit.title}
                </Text>
                <Group
                  gap={3}
                  role="img"
                  aria-label={`${habit.title}: ${habit.pct != null ? `${habit.pct}% logged` : 'not scheduled'} over the last 13 days`}
                >
                  {habit.days.map((logged, i) => (
                    <Box
                      key={i}
                      style={{
                        width: 11, height: 11, borderRadius: 3,
                        background: logged === null ? 'transparent' : logged ? '#9DB8F2' : '#EDF1F6',
                      }}
                    />
                  ))}
                </Group>
                <Text style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {habit.pct != null ? `${habit.pct}%` : '—'}
                </Text>
              </Box>
            ))}
          </Stack>
          <Group align="center" gap={16} mt={18} pt={14} style={{ borderTop: '1px solid #EFF1F5' }}>
            <Group gap={7}>
              <Box style={{ width: 10, height: 10, borderRadius: 3, background: '#9DB8F2' }} />
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>Logged</Text>
            </Group>
            <Group gap={7}>
              <Box style={{ width: 10, height: 10, borderRadius: 3, background: '#EDF1F6' }} />
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>Missed</Text>
            </Group>
            <Box style={{ flex: 1 }} />
            <Text style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B' }}>
              {loggedToday} of {todayHabits.length} logged today
            </Text>
          </Group>
        </>
      )}
    </Box>
  );
}
