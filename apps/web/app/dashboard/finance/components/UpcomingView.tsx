'use client';

import { useState, useMemo } from 'react';
import {
  Stack, Group, Text, Box, Badge, Button, Loader, Center,
  Tabs, Progress,
} from '@mantine/core';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, RotateCcw } from 'lucide-react';
import { useFinanceRecurring, useFinanceAccounts, useApplyRecurring } from '@/hooks/useFinance';
import { FinanceRecurring, FinanceAccount } from '@/lib/api/services/finance';

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function addYears(dateStr: string, years: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function nextDueDate(current: string, frequency: string): string {
  switch (frequency) {
    case 'daily': return addDays(current, 1);
    case 'weekly': return addDays(current, 7);
    case 'monthly': return addMonths(current, 1);
    case 'yearly': return addYears(current, 1);
    default: return current;
  }
}

function fmt(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysFromNow(iso: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function urgencyColor(days: number): string {
  if (days < 0) return 'red';
  if (days <= 7) return 'orange';
  if (days <= 30) return 'yellow';
  return 'green';
}

// ─── Upcoming Bills ──────────────────────────────────────────────────────────

function UpcomingBillsTab() {
  const [horizon, setHorizon] = useState(30);
  const { data: recurring = [], isLoading } = useFinanceRecurring(true);
  const applyRecurring = useApplyRecurring();

  const upcoming = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() + horizon);
    const items: { rule: FinanceRecurring; dueDate: string }[] = [];

    (recurring as FinanceRecurring[]).forEach((rule) => {
      let due = rule.nextDueDate;
      while (new Date(due + 'T00:00:00') <= cutoff) {
        const d = new Date(due + 'T00:00:00');
        if (d >= today) items.push({ rule, dueDate: due });
        due = nextDueDate(due, rule.frequency);
      }
    });

    return items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [recurring, horizon]);

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  return (
    <Stack gap="md">
      <Group gap="xs">
        {[30, 60, 90].map((d) => (
          <Button
            key={d}
            size="xs"
            variant={horizon === d ? 'filled' : 'light'}
            color={horizon === d ? '#0052CC' : 'gray'}
            onClick={() => setHorizon(d)}
          >
            {d} days
          </Button>
        ))}
      </Group>

      {upcoming.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed" size="sm">No bills due in the next {horizon} days.</Text>
        </Center>
      ) : (
        <Stack gap={6}>
          {upcoming.map(({ rule, dueDate }, i) => {
            const days = daysFromNow(dueDate);
            return (
              <Box
                key={`${rule.id}-${dueDate}-${i}`}
                style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', background: '#fff' }}
              >
                <Group justify="space-between">
                  <Box>
                    <Text size="sm" fw={600}>{rule.description}</Text>
                    <Group gap={6} mt={2}>
                      <Badge size="xs" color={urgencyColor(days)} variant="light">
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `in ${days}d`}
                      </Badge>
                      <Text size="xs" c="dimmed">{fmtDate(dueDate)}</Text>
                    </Group>
                  </Box>
                  <Group gap="xs">
                    <Text size="sm" fw={600} c={rule.type === 'income' ? 'green.7' : 'red.7'}>
                      {rule.type === 'expense' ? '−' : '+'}{fmt(rule.amount)}
                    </Text>
                    {dueDate === rule.nextDueDate && (
                      <Button
                        size="xs"
                        variant="light"
                        color="blue"
                        leftSection={<RotateCcw size={11} />}
                        loading={applyRecurring.isPending}
                        onClick={() => applyRecurring.mutate(rule.id)}
                      >
                        Apply
                      </Button>
                    )}
                  </Group>
                </Group>
              </Box>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

// ─── Projection ───────────────────────────────────────────────────────────────

function ProjectionTab() {
  const { data: recurring = [], isLoading: rLoading } = useFinanceRecurring(true);
  const { data: accounts = [], isLoading: aLoading } = useFinanceAccounts();

  const chartData = useMemo(() => {
    const nonCredit = (accounts as FinanceAccount[]).filter((a) => a.type !== 'credit');
    if (!nonCredit.length) return [];

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = 60;
    const balances: Record<string, number> = {};
    nonCredit.forEach((a) => { balances[a.id] = a.balance ?? 0; });

    const points: Record<string, number | string>[] = [];
    let current = { ...balances };

    for (let i = 0; i <= days; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const point: Record<string, number | string> = { date: dateStr.slice(5) }; // MM-DD

      (recurring as FinanceRecurring[]).forEach((rule) => {
        if (rule.nextDueDate === dateStr && current[rule.accountId] !== undefined) {
          const delta = rule.type === 'income' ? rule.amount : -rule.amount;
          current[rule.accountId] = (current[rule.accountId] ?? 0) + delta;
        }
      });

      nonCredit.forEach((a) => { point[a.name] = Math.round(current[a.id] ?? 0); });
      points.push(point);
    }

    return points;
  }, [recurring, accounts]);

  const accountNames = (accounts as FinanceAccount[])
    .filter((a) => a.type !== 'credit')
    .map((a) => a.name);

  const COLORS = ['#0052CC', '#38A169', '#DD6B20', '#805AD5', '#E53E3E'];

  if (rLoading || aLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  if (!accountNames.length) {
    return (
      <Center py="xl">
        <Text c="dimmed" size="sm">No accounts available for projection.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed">Balance projection for the next 60 days based on active recurring rules.</Text>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={9} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(v: number) => fmt(v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {accountNames.map((name, idx) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Stack>
  );
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

function SubscriptionsTab() {
  const { data: recurring = [], isLoading } = useFinanceRecurring(true);

  const subscriptions = useMemo(() => {
    return (recurring as FinanceRecurring[]).filter(
      (r) => r.type === 'expense' && (r.frequency === 'monthly' || r.frequency === 'yearly'),
    );
  }, [recurring]);

  const monthlyTotal = useMemo(() => {
    return subscriptions.reduce((sum, r) => {
      const monthly = r.frequency === 'yearly' ? r.amount / 12 : r.amount;
      return sum + monthly;
    }, 0);
  }, [subscriptions]);

  const yearlyTotal = monthlyTotal * 12;

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  if (subscriptions.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed" size="sm">No recurring subscriptions added yet.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <Group gap="md">
        <Box style={{ flex: 1, background: '#EFF6FF', borderRadius: 10, padding: '12px 16px' }}>
          <Text size="xs" c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly total</Text>
          <Text size="xl" fw={700} c="#0052CC">{fmt(monthlyTotal)}</Text>
        </Box>
        <Box style={{ flex: 1, background: '#F0FDF4', borderRadius: 10, padding: '12px 16px' }}>
          <Text size="xs" c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Yearly total</Text>
          <Text size="xl" fw={700} c="green.7">{fmt(yearlyTotal)}</Text>
        </Box>
      </Group>

      <Stack gap={6}>
        {subscriptions.map((rule) => {
          const monthly = rule.frequency === 'yearly' ? rule.amount / 12 : rule.amount;
          const pct = monthlyTotal > 0 ? (monthly / monthlyTotal) * 100 : 0;
          return (
            <Box
              key={rule.id}
              style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', background: '#fff' }}
            >
              <Group justify="space-between" mb={4}>
                <Box>
                  <Text size="sm" fw={600}>{rule.description}</Text>
                  <Badge size="xs" variant="light" color="blue" mt={2}>
                    {rule.frequency === 'monthly' ? 'Monthly' : 'Yearly'}
                  </Badge>
                </Box>
                <Box style={{ textAlign: 'right' }}>
                  <Text size="sm" fw={600} c="red.7">{fmt(rule.amount)}</Text>
                  {rule.frequency === 'yearly' && (
                    <Text size="xs" c="dimmed">{fmt(monthly)}/mo</Text>
                  )}
                </Box>
              </Group>
              <Progress value={pct} size="xs" color="#0052CC" radius="xl" />
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function UpcomingView() {
  return (
    <Tabs defaultValue="upcoming" color="#0052CC">
      <Tabs.List mb="md">
        <Tabs.Tab value="upcoming" leftSection={<Calendar size={14} />}>Upcoming bills</Tabs.Tab>
        <Tabs.Tab value="projection" leftSection={<TrendingUp size={14} />}>Projection</Tabs.Tab>
        <Tabs.Tab value="subscriptions" leftSection={<RotateCcw size={14} />}>Subscriptions</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="upcoming"><UpcomingBillsTab /></Tabs.Panel>
      <Tabs.Panel value="projection"><ProjectionTab /></Tabs.Panel>
      <Tabs.Panel value="subscriptions"><SubscriptionsTab /></Tabs.Panel>
    </Tabs>
  );
}
