'use client';

import { Box, Group, Stack, Text } from '@mantine/core';
import { useNetWorth } from '@/hooks/useFinance';
import { useFinanceCurrency } from '../../currency-context';
import { fmtCurrency } from './billUtils';
import { BigStatSkeleton } from '../../components/skeletons';

// Illiquid is 0 here until Block 6 wires real asset-class data through
// getNetWorth — the UI already states the liquid/illiquid split and the
// projection-exclusion rule explicitly, per FINANCE-SPEC.md's "say the scope"
// principle.
export function NetWorthPanel() {
  const { displayCurrency } = useFinanceCurrency();
  const { data, isLoading } = useNetWorth(displayCurrency);

  if (isLoading) return <BigStatSkeleton />;
  if (!data) return null;

  const total = data.liquid + data.illiquid;
  const liquidPct = total > 0 ? (data.liquid / total) * 100 : 0;
  const illiquidPct = total > 0 ? (data.illiquid / total) * 100 : 0;

  return (
    <Box>
      <Text style={{ fontSize: 15, fontWeight: 700 }}>Net worth</Text>
      <Text style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 16px' }}>
        Cash and every asset you track. Illiquid assets count towards net worth but stay out of the balance projection.
      </Text>
      <Text style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {fmtCurrency(data.netWorth, displayCurrency)}
      </Text>

      <Stack gap={14} mt={22}>
        <Stack gap={7}>
          <Group gap={10} align="baseline" wrap="nowrap">
            <Text style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600 }}>Liquid</Text>
            <Text style={{ fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {fmtCurrency(data.liquid, displayCurrency)}
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', width: 38, textAlign: 'right' }}>{liquidPct.toFixed(1)}%</Text>
          </Group>
          <Box style={{ height: 8, background: '#EDF1F6', borderRadius: 4, overflow: 'hidden' }}>
            <Box style={{ width: `${liquidPct}%`, height: '100%', background: '#9DB8F2' }} />
          </Box>
          <Text style={{ fontSize: 12, color: '#64748B' }}>Cash accounts</Text>
        </Stack>

        <Stack gap={7}>
          <Group gap={10} align="baseline" wrap="nowrap">
            <Text style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600 }}>Illiquid</Text>
            <Text style={{ fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {fmtCurrency(data.illiquid, displayCurrency)}
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', width: 38, textAlign: 'right' }}>{illiquidPct.toFixed(1)}%</Text>
          </Group>
          <Box style={{ height: 8, background: '#EDF1F6', borderRadius: 4, overflow: 'hidden' }}>
            <Box style={{ width: `${illiquidPct}%`, height: '100%', background: '#C2D2F6' }} />
          </Box>
          <Text style={{ fontSize: 12, color: '#64748B' }}>
            {data.illiquid > 0
              ? 'Property, vehicles, equipment and other tracked assets'
              : 'No illiquid assets tracked yet — Portfolio (coming in a later update) will let you add real estate, vehicles and more'}
          </Text>
        </Stack>

        <Group justify="space-between" align="baseline" pt={14} style={{ borderTop: '1px solid #EFF1F5' }}>
          <Text style={{ fontSize: 13, color: '#64748B' }}>Credit card owed</Text>
          <Text style={{
            fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
            color: data.creditCardOwed > 0 ? '#B91C1C' : '#0F172A',
          }}>
            {data.creditCardOwed > 0 ? '−' : ''}{fmtCurrency(data.creditCardOwed, displayCurrency)}
          </Text>
        </Group>
      </Stack>
    </Box>
  );
}
