'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Group, Stack, Text } from '@mantine/core';
import { useFinanceOverview } from '@/hooks/useFinance';
import { BigStatSkeleton } from './skeletons';

function fmt(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#64748B',
};

export function FinanceCard() {
  const [currency] = useState<string>(() => {
    try { return localStorage.getItem('finance_display_currency') ?? 'USD'; } catch { return 'USD'; }
  });
  const { data: overview, isLoading } = useFinanceOverview(undefined, currency);

  const displayCurrency = overview?.displayCurrency ?? currency;
  const hasData = overview && Object.keys(overview.balanceByCurrency ?? {}).length > 0;
  const net = (overview?.totalIncomeConverted ?? 0) - (overview?.totalExpensesConverted ?? 0);
  const savedPct = overview && overview.totalIncomeConverted > 0
    ? (net / overview.totalIncomeConverted) * 100
    : null;

  return (
    <Box id="finance" style={{ padding: '20px 24px' }}>
      <Group justify="space-between" mb={14}>
        <Text style={LABEL}>Finance</Text>
        <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8' }}>
          Consolidated · {displayCurrency}
        </Text>
      </Group>

      {isLoading ? (
        <BigStatSkeleton />
      ) : !hasData ? (
        <Stack gap={10}>
          <Text style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: '#94A3B8', lineHeight: 1 }}>
            {fmt(0, currency)}
          </Text>
          <Link href="/dashboard/finance" style={{ fontSize: 13, fontWeight: 500, color: '#0052CC', textDecoration: 'none' }}>
            Connect an account →
          </Link>
        </Stack>
      ) : (
        <Stack gap={10}>
          <Text style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: '#0F172A', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {fmt(overview?.totalBalanceConverted ?? 0, displayCurrency)}
          </Text>
          <Group gap={8} align="center">
            <Text style={{
              fontSize: 13, fontWeight: 700, color: net >= 0 ? '#15803D' : '#B91C1C',
              background: net >= 0 ? '#F0FDF4' : '#FEF2F2', borderRadius: 4, padding: '2px 8px',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {net >= 0 ? '+' : '−'}{fmt(Math.abs(net), displayCurrency)}
            </Text>
            <Text size="xs" c="dimmed">this month</Text>
          </Group>

          <Group gap={20} mt={4} pt={14} style={{ borderTop: '1px solid #F1F5F9' }} wrap="wrap">
            <Stack gap={2}>
              <Text style={LABEL}>Income</Text>
              <Text style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {fmt(overview?.totalIncomeConverted ?? 0, displayCurrency)}
              </Text>
            </Stack>
            <Stack gap={2}>
              <Text style={LABEL}>Expenses</Text>
              <Text style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {fmt(overview?.totalExpensesConverted ?? 0, displayCurrency)}
              </Text>
            </Stack>
            <Stack gap={2}>
              <Text style={LABEL}>Savings rate</Text>
              <Text style={{ fontSize: 14, fontWeight: 600 }}>
                {savedPct === null ? '—' : `${savedPct.toFixed(0)}%`}
              </Text>
            </Stack>
          </Group>

          <Link href="/dashboard/finance" style={{ fontSize: 13, fontWeight: 500, color: '#0052CC', textDecoration: 'none' }}>
            View Finance →
          </Link>
        </Stack>
      )}
    </Box>
  );
}
