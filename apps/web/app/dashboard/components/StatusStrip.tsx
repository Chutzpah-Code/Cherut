'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Group, Stack, Text, Title } from '@mantine/core';
import { useTasks } from '@/hooks/useTasks';
import { useTodayHabits } from '@/hooks/useHabits';
import { useFinanceOverview } from '@/hooks/useFinance';
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

function fmtCurrency(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${currency} ${value.toFixed(0)}`;
  }
}

function Tile({ href, label, value, tone }: { href: string; label: string; value: string; tone?: 'danger' | 'accent' }) {
  const color = tone === 'danger' ? '#B91C1C' : tone === 'accent' ? '#0052CC' : '#0F172A';
  return (
    <Link href={href} style={{ textDecoration: 'none', flex: '1 1 0', minWidth: 132 }}>
      <Box
        style={{
          background: '#F8FAFC',
          border: '1px solid #E8EBF0',
          borderRadius: 6,
          padding: '10px 16px',
          height: '100%',
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B' }}>
          {label}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: 700, color, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Text>
      </Box>
    </Link>
  );
}

export function StatusStrip() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const today = localToday();

  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: todayHabits = [], isLoading: habitsLoading } = useTodayHabits(today);
  const [currency] = useState<string>(() => {
    try { return localStorage.getItem('finance_display_currency') ?? 'USD'; } catch { return 'USD'; }
  });
  const { data: overview, isLoading: financeLoading } = useFinanceOverview(undefined, currency);

  const { overdueCount, dueTodayCount } = useMemo(() => {
    let overdue = 0;
    let dueToday = 0;
    for (const t of tasks as any[]) {
      if (!t.dueDate || t.status === 'done' || t.archived) continue;
      if (t.dueDate < today) overdue++;
      else if (t.dueDate === today) dueToday++;
    }
    return { overdueCount: overdue, dueTodayCount: dueToday };
  }, [tasks, today]);

  const loggedHabits = todayHabits.filter((h) => h.loggedToday).length;
  const scheduledHabits = todayHabits.length;

  const firstName = profile?.displayName?.split(' ')[0] ?? user?.displayName?.split(' ')[0] ?? '';
  const attentionCount = overdueCount + dueTodayCount;
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const isLoading = tasksLoading || habitsLoading || financeLoading;

  return (
    <Box style={{ padding: '22px 24px' }}>
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs" mb={16}>
        <Stack gap={2}>
          <Title order={1} style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#0F172A', lineHeight: 1.2 }}>
            {greeting()}{firstName ? `, ${firstName}` : ''}
          </Title>
          <Text size="sm" c="dimmed">
            {dateLabel}
            {attentionCount > 0 && ` · ${attentionCount} item${attentionCount !== 1 ? 's' : ''} need attention`}
          </Text>
        </Stack>
      </Group>

      {isLoading ? (
        <TilesSkeleton count={4} />
      ) : (
        <Group gap={10} wrap="wrap" style={{ overflowX: 'auto', flexWrap: 'nowrap' }} className="dashboard-kpi-row">
          <Tile href="#tasks-due" label="Overdue" value={String(overdueCount)} tone={overdueCount > 0 ? 'danger' : undefined} />
          <Tile href="#tasks-due" label="Due today" value={String(dueTodayCount)} tone={dueTodayCount > 0 ? 'accent' : undefined} />
          <Tile href="/dashboard/habits" label="Habits" value={`${loggedHabits}/${scheduledHabits}`} />
          <Tile href="/dashboard/finance" label="Balance" value={fmtCurrency(overview?.totalBalanceConverted ?? 0, overview?.displayCurrency ?? currency)} />
        </Group>
      )}
    </Box>
  );
}
