'use client';

import { Box, Group, Center, Stack, Text } from '@mantine/core';
import { AlertTriangle } from 'lucide-react';
import { useFinanceOverview, useNetWorth } from '@/hooks/useFinance';
import { useFinanceCurrency } from '../currency-context';
import { BigStatSkeleton } from './skeletons';

function fmt(value: number, currency?: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD' }).format(value);
  } catch {
    return `${currency ?? ''} ${value.toFixed(2)}`;
  }
}

const MICRO_LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B',
};

// Net worth reads from the same getNetWorth() endpoint the Bills & Portfolio
// summary tile and Net worth panel use, so the number matches everywhere it
// appears (illiquid is 0 until Block 6 wires real asset-class data).
export function BalanceBand() {
  const { displayCurrency } = useFinanceCurrency();
  const { data, isLoading } = useFinanceOverview(undefined, displayCurrency);
  const { data: netWorthData } = useNetWorth(displayCurrency);

  if (isLoading) return <BigStatSkeleton />;
  if (!data) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <AlertTriangle size={20} color="#c2410c" />
          <Text size="sm" c="dimmed">Failed to load balance. Try refreshing the page.</Text>
        </Stack>
      </Center>
    );
  }

  const net = data.totalIncomeConverted - data.totalExpensesConverted;
  const savedPct = data.totalIncomeConverted > 0 ? (net / data.totalIncomeConverted) * 100 : null;
  const netWorth = netWorthData?.netWorth ?? data.totalBalanceConverted;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const isEmpty = data.totalBalanceConverted === 0 && data.totalIncomeConverted === 0 && data.totalExpensesConverted === 0;

  return (
    <Box>
      <Text style={MICRO_LABEL}>Consolidated total</Text>
      <Text style={{
        fontSize: 40, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.05, margin: '10px 0 12px',
        color: isEmpty ? '#94A3B8' : '#0F172A', fontVariantNumeric: 'tabular-nums',
      }}>
        {fmt(data.totalBalanceConverted, displayCurrency)}
      </Text>

      {isEmpty ? (
        <Text style={{ fontSize: 13.5, color: '#64748B', maxWidth: 380 }}>
          Add an account and your first transaction — the total, spending and projections all build from there.
        </Text>
      ) : (
        <>
          <Group gap={10} align="center">
            <Text style={{
              fontSize: 13, fontWeight: 700, color: net >= 0 ? '#15803D' : '#B91C1C',
              background: net >= 0 ? '#F0FDF4' : '#FEF2F2', borderRadius: 4, padding: '3px 8px',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {net >= 0 ? '+' : '−'}{fmt(Math.abs(net), displayCurrency)}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B' }}>this month · as of {today}</Text>
          </Group>

          <Group gap={28} mt={22} pt={18} style={{ borderTop: '1px solid #EFF1F5' }} wrap="wrap">
            <Stack gap={4}>
              <Text style={MICRO_LABEL}>Income</Text>
              <Text style={{ fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(data.totalIncomeConverted, displayCurrency)}
              </Text>
            </Stack>
            <Stack gap={4}>
              <Text style={MICRO_LABEL}>Expenses</Text>
              <Text style={{ fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(data.totalExpensesConverted, displayCurrency)}
              </Text>
            </Stack>
            <Stack gap={4}>
              <Text style={MICRO_LABEL}>Saved</Text>
              <Text style={{ fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                {savedPct === null ? '—' : `${savedPct.toFixed(0)}%`}
              </Text>
            </Stack>
            <Stack gap={4}>
              <Text style={MICRO_LABEL}>Net worth</Text>
              <Text style={{ fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(netWorth, displayCurrency)}
              </Text>
            </Stack>
          </Group>
        </>
      )}
    </Box>
  );
}
