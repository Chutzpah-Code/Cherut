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
import { useBillOccurrences, useBills } from '@/hooks/useBills';
import { useFinanceAccounts } from '@/hooks/useFinance';
import { FinanceBillOccurrence, FinanceBill } from '@/lib/api/services/bills';
import { FinanceAccount } from '@/lib/api/services/finance';

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

function currentYYYYMM(): string {
  return new Date().toISOString().slice(0, 7);
}

function addOneMonth(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-').map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Upcoming Bills ──────────────────────────────────────────────────────────

function UpcomingBillsTab() {
  const [horizon, setHorizon] = useState(30);
  const thisMonth = currentYYYYMM();
  const nxtMonth = addOneMonth(thisMonth);

  const { data: thisOcc = [], isLoading: l1 } = useBillOccurrences(thisMonth);
  const { data: nextOcc = [], isLoading: l2 } = useBillOccurrences(nxtMonth);
  const isLoading = l1 || l2;

  const upcoming = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() + horizon);
    const all = [...(thisOcc as FinanceBillOccurrence[]), ...(nextOcc as FinanceBillOccurrence[])];
    return all
      .filter((o) => (o.status === 'pending' || o.status === 'overdue') && new Date(o.dueDate + 'T00:00:00') <= cutoff)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [thisOcc, nextOcc, horizon]);

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
          {upcoming.map((occ) => {
            const days = daysFromNow(occ.dueDate);
            return (
              <Box
                key={occ.id}
                style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', background: '#fff' }}
              >
                <Group justify="space-between">
                  <Box>
                    <Text size="sm" fw={600}>{occ.bill?.name ?? '—'}</Text>
                    <Group gap={6} mt={2}>
                      <Badge size="xs" color={urgencyColor(days)} variant="light">
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `in ${days}d`}
                      </Badge>
                      <Text size="xs" c="dimmed">{fmtDate(occ.dueDate)}</Text>
                    </Group>
                  </Box>
                  <Text size="sm" fw={600} c={occ.bill?.type === 'income' ? 'green.7' : 'red.7'}>
                    {occ.bill?.type === 'expense' ? '−' : '+'}{fmt(occ.amount)}
                  </Text>
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
  const thisMonth = currentYYYYMM();
  const nxtMonth = addOneMonth(thisMonth);
  const { data: thisOcc = [], isLoading: l1 } = useBillOccurrences(thisMonth);
  const { data: nextOcc = [], isLoading: l2 } = useBillOccurrences(nxtMonth);
  const { data: accounts = [], isLoading: aLoading } = useFinanceAccounts();

  const chartData = useMemo(() => {
    const nonCredit = (accounts as FinanceAccount[]).filter((a) => a.type !== 'credit');
    if (!nonCredit.length) return [];

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = 60;

    const pending = [...(thisOcc as FinanceBillOccurrence[]), ...(nextOcc as FinanceBillOccurrence[])]
      .filter((o) => o.status === 'pending' || o.status === 'overdue');

    const current: Record<string, number> = {};
    nonCredit.forEach((a) => { current[a.id] = a.balance ?? 0; });

    const points: Record<string, number | string>[] = [];

    for (let i = 0; i <= days; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const point: Record<string, number | string> = { date: dateStr.slice(5) };

      pending.forEach((occ) => {
        if (occ.dueDate === dateStr && occ.bill && current[occ.bill.accountId] !== undefined) {
          const delta = occ.bill.type === 'income' ? occ.amount : -occ.amount;
          current[occ.bill.accountId] = (current[occ.bill.accountId] ?? 0) + delta;
        }
      });

      nonCredit.forEach((a) => { point[a.name] = Math.round(current[a.id] ?? 0); });
      points.push(point);
    }

    return points;
  }, [thisOcc, nextOcc, accounts]);

  const accountNames = (accounts as FinanceAccount[])
    .filter((a) => a.type !== 'credit')
    .map((a) => a.name);

  const COLORS = ['#0052CC', '#38A169', '#DD6B20', '#805AD5', '#E53E3E'];

  if (l1 || l2 || aLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  if (!accountNames.length) {
    return (
      <Center py="xl">
        <Text c="dimmed" size="sm">No accounts available for projection.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed">Balance projection for the next 60 days based on pending bills.</Text>
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
  const { data: bills = [], isLoading } = useBills();

  const subscriptions = useMemo(() => {
    return (bills as FinanceBill[]).filter(
      (b) => b.isActive && b.type === 'expense' && (b.frequency === 'monthly' || b.frequency === 'yearly'),
    );
  }, [bills]);

  const monthlyTotal = useMemo(() => {
    return subscriptions.reduce((sum, b) => {
      return sum + (b.frequency === 'yearly' ? b.amount / 12 : b.amount);
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
        {subscriptions.map((bill) => {
          const monthly = bill.frequency === 'yearly' ? bill.amount / 12 : bill.amount;
          const pct = monthlyTotal > 0 ? (monthly / monthlyTotal) * 100 : 0;
          return (
            <Box
              key={bill.id}
              style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', background: '#fff' }}
            >
              <Group justify="space-between" mb={4}>
                <Box>
                  <Text size="sm" fw={600}>{bill.name}</Text>
                  <Badge size="xs" variant="light" color="blue" mt={2}>
                    {bill.frequency === 'monthly' ? 'Monthly' : 'Yearly'}
                  </Badge>
                </Box>
                <Box style={{ textAlign: 'right' }}>
                  <Text size="sm" fw={600} c="red.7">{fmt(bill.amount)}</Text>
                  {bill.frequency === 'yearly' && (
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
