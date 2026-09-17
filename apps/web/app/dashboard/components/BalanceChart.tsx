'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Group, Stack, Text } from '@mantine/core';
import { useBalanceHistory } from '@/hooks/useFinance';
import { useFinanceOverview } from '@/hooks/useFinance';
import { ChartSkeleton } from './skeletons';

function fmt(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function fmtAxisDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const LABEL: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#0F172A' };
const MICRO: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B' };

export function BalanceChart() {
  const [currency] = useState<string>(() => {
    try { return localStorage.getItem('finance_display_currency') ?? 'USD'; } catch { return 'USD'; }
  });
  const { data: history, isLoading: historyLoading } = useBalanceHistory(30, currency);
  const { data: overview, isLoading: overviewLoading } = useFinanceOverview(undefined, currency);

  const isLoading = historyLoading || overviewLoading;
  const points = history?.points ?? [];
  const hasData = points.length > 0 && points.some((p) => p.total !== 0);
  const maxValue = Math.max(1, ...points.map((p) => Math.max(0, p.total)));
  const current = points[points.length - 1]?.total ?? 0;
  const displayCurrency = history?.displayCurrency ?? currency;

  const net = (overview?.totalIncomeConverted ?? 0) - (overview?.totalExpensesConverted ?? 0);
  const savedPct = overview && overview.totalIncomeConverted > 0 ? (net / overview.totalIncomeConverted) * 100 : null;

  return (
    <Box style={{ padding: '24px 28px 26px' }}>
      <Group justify="space-between" align="baseline">
        <Text style={LABEL}>Balance</Text>
        <Link href="/dashboard/finance" style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', textDecoration: 'none' }}>Finance</Link>
      </Group>

      {isLoading ? (
        <Box mt="md"><ChartSkeleton /></Box>
      ) : !hasData ? (
        <Stack mt="md" gap={4}>
          <Text style={{ fontSize: 30, fontWeight: 700, color: '#94A3B8' }}>{fmt(0, displayCurrency)}</Text>
          <Text size="sm" c="dimmed">No transactions in the last 30 days.</Text>
        </Stack>
      ) : (
        <>
          <Group align="baseline" gap={10} mt={14} mb={4}>
            <Text style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
              {fmt(current, displayCurrency)}
            </Text>
            {history?.deltaPct != null && (
              <Text style={{
                fontSize: 13, fontWeight: 700, borderRadius: 4, padding: '3px 8px', fontVariantNumeric: 'tabular-nums',
                color: history.deltaPct >= 0 ? '#15803D' : '#B91C1C',
                background: history.deltaPct >= 0 ? '#F0FDF4' : '#FEF2F2',
              }}>
                {history.deltaPct >= 0 ? '+' : ''}{history.deltaPct.toFixed(1)}%
              </Text>
            )}
          </Group>
          <Text style={{ fontSize: 12.5, color: '#64748B', marginBottom: 16 }}>
            From transactions · last 30 days · all cash accounts
          </Text>

          <Box
            role="img"
            aria-label={`Balance ${fmt(current, displayCurrency)}, ${history?.deltaPct != null ? `${history.deltaPct >= 0 ? 'up' : 'down'} ${Math.abs(history.deltaPct).toFixed(1)}%` : 'no change data'} over the last 30 days`}
            style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 104, paddingBottom: 8, borderBottom: '1px solid #E2E5EB' }}
          >
            {points.map((p, i) => {
              const pct = p.total > 0 ? Math.max(2 / 104 * 100, (p.total / maxValue) * 100) : 0;
              const isLast = i === points.length - 1;
              return (
                <Box
                  key={p.date}
                  style={{ flex: 1, height: `${pct}%`, background: isLast ? '#9DB8F2' : '#E7EDFB', borderRadius: '2px 2px 0 0' }}
                />
              );
            })}
          </Box>
          <Group justify="space-between" mt={8}>
            <Text style={{ fontSize: 11.5, color: '#64748B' }}>{fmtAxisDate(points[0].date)}</Text>
            <Text style={{ fontSize: 11.5, color: '#64748B' }}>{fmtAxisDate(points[Math.floor(points.length / 2)].date)}</Text>
            <Text style={{ fontSize: 11.5, color: '#64748B' }}>{fmtAxisDate(points[points.length - 1].date)}</Text>
          </Group>

          <Group gap={24} mt={16} pt={14} style={{ borderTop: '1px solid #EFF1F5' }} wrap="wrap">
            <Stack gap={3}>
              <Text style={MICRO}>Income</Text>
              <Text style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(overview?.totalIncomeConverted ?? 0, displayCurrency)}
              </Text>
            </Stack>
            <Stack gap={3}>
              <Text style={MICRO}>Expenses</Text>
              <Text style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(overview?.totalExpensesConverted ?? 0, displayCurrency)}
              </Text>
            </Stack>
            <Stack gap={3}>
              <Text style={MICRO}>Saved</Text>
              <Text style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {savedPct === null ? '—' : `${savedPct.toFixed(0)}%`}
              </Text>
            </Stack>
          </Group>
        </>
      )}
    </Box>
  );
}
