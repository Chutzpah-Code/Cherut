'use client';

import { useMemo, useState } from 'react';
import { Box, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useTasks } from '@/hooks/useTasks';
import { useTodayHabits, useHabitConsistency } from '@/hooks/useHabits';
import { useNetWorth } from '@/hooks/useFinance';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { TilesSkeleton } from './skeletons';

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function fmtCompact(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(value);
  } catch {
    return `${currency} ${value.toFixed(0)}`;
  }
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'danger' }) {
  return (
    <Box
      style={{
        background: '#F8FAFC', border: '1px solid #E8EBF0', borderRadius: 6,
        padding: '11px 16px', minWidth: 130, minHeight: 76, height: '100%', boxSizing: 'border-box',
      }}
    >
      <Text style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B' }}>
        {label}
      </Text>
      <Text style={{
        fontSize: 20, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap', marginTop: 5,
        color: tone === 'danger' ? '#B91C1C' : '#0F172A', fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </Text>
      {sub && (
        <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 5 }}>
          {sub}
        </Text>
      )}
    </Box>
  );
}

export function StatusStrip() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const today = localToday();

  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: todayHabits = [], isLoading: habitsLoading } = useTodayHabits(today);
  const { data: consistency, isLoading: consistencyLoading } = useHabitConsistency(14);
  const [currency] = useState<string>(() => {
    try { return localStorage.getItem('finance_display_currency') ?? 'USD'; } catch { return 'USD'; }
  });
  const { data: netWorth, isLoading: netWorthLoading } = useNetWorth(currency);

  const { overdueCount, dueTodayCount, oldestOverdueDays } = useMemo(() => {
    let overdue = 0;
    let dueToday = 0;
    let oldestDays = 0;
    for (const t of tasks as any[]) {
      if (!t.dueDate || t.status === 'done' || t.archived) continue;
      if (t.dueDate < today) {
        overdue++;
        const days = Math.floor((new Date(`${today}T00:00:00`).getTime() - new Date(`${t.dueDate}T00:00:00`).getTime()) / 86_400_000);
        if (days > oldestDays) oldestDays = days;
      } else if (t.dueDate === today) {
        dueToday++;
      }
    }
    return { overdueCount: overdue, dueTodayCount: dueToday, oldestOverdueDays: oldestDays };
  }, [tasks, today]);

  const loggedToday = todayHabits.filter((h) => h.loggedToday).length;
  const scheduledToday = todayHabits.length;

  const firstName = profile?.displayName?.split(' ')[0] ?? user?.displayName?.split(' ')[0] ?? '';
  const attentionCount = overdueCount + dueTodayCount;
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const isLoading = tasksLoading || habitsLoading || consistencyLoading || netWorthLoading;

  return (
    <Box style={{ padding: '22px 32px' }}>
      <Group justify="space-between" align="center" wrap="wrap" gap="xl">
        <Stack gap={4}>
          <Title order={1} style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', color: '#0F172A' }}>
            {greeting()}{firstName ? `, ${firstName}` : ''}
          </Title>
          <Text style={{ fontSize: 13, color: '#64748B' }}>
            {dateLabel}
            {attentionCount > 0 && ` · ${attentionCount} item${attentionCount !== 1 ? 's' : ''} need attention`}
          </Text>
        </Stack>

        {isLoading ? (
          <TilesSkeleton count={4} />
        ) : (
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={10} style={{ width: '100%' }}>
            <Tile
              label="Overdue"
              value={String(overdueCount)}
              sub={overdueCount > 0 ? `Oldest ${oldestOverdueDays} day${oldestOverdueDays !== 1 ? 's' : ''} late` : undefined}
              tone={overdueCount > 0 ? 'danger' : undefined}
            />
            <Tile label="Due today" value={String(dueTodayCount)} />
            <Tile
              label="Habits"
              value={`${loggedToday}/${scheduledToday}`}
              sub={consistency?.overallPct != null ? `${consistency.overallPct}% last 14 days` : undefined}
            />
            <Tile
              label="Net worth"
              value={fmtCompact(netWorth?.netWorth ?? 0, netWorth?.displayCurrency ?? currency)}
              sub={netWorth?.monthChangePct != null ? `${netWorth.monthChangePct >= 0 ? '+' : ''}${netWorth.monthChangePct.toFixed(1)}% this month` : undefined}
            />
          </SimpleGrid>
        )}
      </Group>
    </Box>
  );
}
