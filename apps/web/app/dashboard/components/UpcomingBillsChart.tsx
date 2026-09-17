'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Group, Text } from '@mantine/core';
import { useUpcomingBillsAndStatements } from '@/hooks/useFinance';
import { ChartSkeleton } from './skeletons';

function fmt(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const LABEL: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#0F172A' };
const WEEK_NAMES = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];

export function UpcomingBillsChart() {
  const [currency] = useState<string>(() => {
    try { return localStorage.getItem('finance_display_currency') ?? 'USD'; } catch { return 'USD'; }
  });
  const { data: items = [], isLoading } = useUpcomingBillsAndStatements(30);
  const today = localToday();

  const { overdueTotal, weekTotals, heaviestWeek } = useMemo(() => {
    const startOfToday = new Date(`${today}T00:00:00`).getTime();
    let overdue = 0;
    const weeks = [0, 0, 0, 0];
    for (const item of items as any[]) {
      if (item.status === 'paid' || item.status === 'cancelled' || item.status === 'skipped') continue;
      if (item.status === 'overdue' || item.dueDate < today) {
        overdue += item.amount;
        continue;
      }
      const daysOut = Math.floor((new Date(`${item.dueDate}T00:00:00`).getTime() - startOfToday) / 86_400_000);
      const weekIndex = Math.min(3, Math.floor(daysOut / 7));
      if (weekIndex >= 0) weeks[weekIndex] += item.amount;
    }
    let heaviestIdx = 0;
    for (let i = 1; i < weeks.length; i++) if (weeks[i] > weeks[heaviestIdx]) heaviestIdx = i;
    return { overdueTotal: overdue, weekTotals: weeks, heaviestWeek: heaviestIdx };
  }, [items, today]);

  const total = overdueTotal + weekTotals.reduce((s, v) => s + v, 0);
  const hasData = total > 0;
  const maxValue = Math.max(1, overdueTotal, ...weekTotals);

  return (
    <Box style={{ padding: '24px 28px 26px' }}>
      <Group justify="space-between" align="baseline">
        <Text style={LABEL}>Upcoming bills</Text>
        <Link href="/dashboard/finance/portfolio" style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', textDecoration: 'none' }}>Bills</Link>
      </Group>
      <Text style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 18px' }}>
        From bill occurrences · next 30 days{hasData ? ` · ${fmt(total, currency)}` : ''}
      </Text>

      {isLoading ? (
        <ChartSkeleton height={96} />
      ) : !hasData ? (
        <Text size="sm" c="dimmed">No bills due in the next 30 days.</Text>
      ) : (
        <>
          <Box
            role="img"
            aria-label={`Upcoming bills: ${fmt(overdueTotal, currency)} overdue, heaviest week is week ${heaviestWeek + 1}`}
            style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 96, paddingBottom: 8, borderBottom: '1px solid #E2E5EB' }}
          >
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              {overdueTotal > 0 && (
                <Box style={{ height: `${Math.max(2, (overdueTotal / maxValue) * 100)}%`, background: '#F0A8A2', borderRadius: '2px 2px 0 0' }} />
              )}
            </Box>
            {weekTotals.map((v, i) => (
              <Box key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                {v > 0 && (
                  <Box style={{ height: `${Math.max(2, (v / maxValue) * 100)}%`, background: i === 0 ? '#9DB8F2' : '#C2D2F6', borderRadius: '2px 2px 0 0' }} />
                )}
              </Box>
            ))}
          </Box>
          <Group gap={10} mt={6}>
            <Text style={{ flex: 1, fontSize: 11, color: '#64748B', textAlign: 'center' }}>Late</Text>
            {WEEK_NAMES.map((w) => (
              <Text key={w} style={{ flex: 1, fontSize: 11, color: '#64748B', textAlign: 'center' }}>{w}</Text>
            ))}
          </Group>
          <Group align="center" gap={16} mt={16} pt={14} style={{ borderTop: '1px solid #EFF1F5' }}>
            <Group gap={7}>
              <Box style={{ width: 10, height: 10, borderRadius: 2, background: '#F0A8A2' }} />
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>Overdue {fmt(overdueTotal, currency)}</Text>
            </Group>
            <Box style={{ flex: 1 }} />
            <Text style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B' }}>Heaviest: week {heaviestWeek + 1}</Text>
          </Group>
        </>
      )}
    </Box>
  );
}
