'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Group, Stack, Text } from '@mantine/core';
import { useNetWorth, useUpcomingBillsAndStatements } from '@/hooks/useFinance';
import { BigStatSkeleton } from './skeletons';

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

export function NetWorthSummary() {
  const [currency] = useState<string>(() => {
    try { return localStorage.getItem('finance_display_currency') ?? 'USD'; } catch { return 'USD'; }
  });
  const { data, isLoading } = useNetWorth(currency);
  const { data: upcoming = [] } = useUpcomingBillsAndStatements(7);
  const today = localToday();

  const dueIn7Days = useMemo(() => {
    return (upcoming as any[])
      .filter((i) => i.status !== 'paid' && i.status !== 'cancelled' && i.status !== 'skipped' && i.dueDate >= today)
      .reduce((sum, i) => sum + i.amount, 0);
  }, [upcoming, today]);

  const total = (data?.liquid ?? 0) + (data?.illiquid ?? 0);
  const hasData = total !== 0 || (data?.creditCardOwed ?? 0) !== 0;
  const liquidPct = total > 0 ? (data!.liquid / total) * 100 : 0;
  const illiquidPct = total > 0 ? (data!.illiquid / total) * 100 : 0;

  return (
    <Box style={{ padding: '24px 28px 28px' }}>
      <Group justify="space-between" align="baseline">
        <Text style={LABEL}>Net worth</Text>
        <Link href="/dashboard/finance/portfolio" style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', textDecoration: 'none' }}>Portfolio</Link>
      </Group>
      <Text style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 14px' }}>From account balances and asset valuations</Text>

      {isLoading ? (
        <BigStatSkeleton />
      ) : !hasData ? (
        <Stack gap={6}>
          <Text style={{ fontSize: 28, fontWeight: 700, color: '#94A3B8' }}>{fmt(0, currency)}</Text>
          <Text size="sm" c="dimmed">Add an account or asset to see your net worth.</Text>
        </Stack>
      ) : (
        <>
          <Text style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
            {fmt(data!.netWorth, data?.displayCurrency ?? currency)}
          </Text>
          <Stack gap={14} mt={20}>
            <Stack gap={7}>
              <Group align="baseline" gap={10}>
                <Text style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600 }}>Liquid</Text>
                <Text style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(data!.liquid, currency)}
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', width: 38, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {liquidPct.toFixed(1)}%
                </Text>
              </Group>
              <Box style={{ height: 8, background: '#EDF1F6', borderRadius: 4, overflow: 'hidden' }}>
                <Box style={{ width: `${liquidPct}%`, height: '100%', background: '#9DB8F2' }} />
              </Box>
            </Stack>
            <Stack gap={7}>
              <Group align="baseline" gap={10}>
                <Text style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600 }}>Illiquid</Text>
                <Text style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(data!.illiquid, currency)}
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', width: 38, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {illiquidPct.toFixed(1)}%
                </Text>
              </Group>
              <Box style={{ height: 8, background: '#EDF1F6', borderRadius: 4, overflow: 'hidden' }}>
                <Box style={{ width: `${illiquidPct}%`, height: '100%', background: '#C2D2F6' }} />
              </Box>
            </Stack>
            <Group justify="space-between" align="baseline" pt={14} style={{ borderTop: '1px solid #EFF1F5' }}>
              <Text style={{ fontSize: 13, color: '#64748B' }}>Due in 7 days</Text>
              <Text style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{fmt(dueIn7Days, currency)}</Text>
            </Group>
            <Group justify="space-between" align="baseline">
              <Text style={{ fontSize: 13, color: '#64748B' }}>Credit card owed</Text>
              <Text style={{ fontSize: 13.5, fontWeight: 600, color: '#B91C1C', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                {(data?.creditCardOwed ?? 0) > 0 ? '−' : ''}{fmt(data?.creditCardOwed ?? 0, currency)}
              </Text>
            </Group>
          </Stack>
        </>
      )}
    </Box>
  );
}
