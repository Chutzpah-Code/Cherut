'use client';

import { Box, Group, Text } from '@mantine/core';
import { useBills } from '@/hooks/useBills';
import { useNetWorth, useUpcomingBillsAndStatements } from '@/hooks/useFinance';
import { useFinanceCurrency } from '../../currency-context';
import { monthlyEquivalent, fmtCurrency } from './billUtils';
import { FinanceBill } from '@/lib/api/services/bills';
import { UpcomingBillItem } from '@/lib/api/services/finance';

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function Tile({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <Box style={{ background: '#F8FAFC', border: '1px solid #E8EBF0', borderRadius: 6, padding: '10px 16px', minWidth: 132, flexShrink: 0 }}>
      <Text style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B' }}>
        {label}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap', color: valueColor ?? '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    </Box>
  );
}

export function SummaryTiles() {
  const { displayCurrency } = useFinanceCurrency();
  const { data: items = [] } = useUpcomingBillsAndStatements(90);
  const { data: bills = [] } = useBills();
  const { data: netWorth } = useNetWorth(displayCurrency);

  const today = localToday();
  const in7 = addDays(today, 7);
  const list = items as UpcomingBillItem[];
  const due7 = list.filter((o) => o.dueDate <= in7 && o.status !== 'overdue');
  const overdue = list.filter((o) => o.status === 'overdue');
  const committed = (bills as FinanceBill[])
    .filter((b) => b.isActive && b.type === 'expense')
    .reduce((s, b) => s + monthlyEquivalent(b), 0);

  return (
    <Group gap={10} wrap="nowrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 2 }}>
      <Tile label="Due in 7 days" value={fmtCurrency(due7.reduce((s, o) => s + o.amount, 0), displayCurrency)} />
      <Tile
        label="Overdue"
        value={fmtCurrency(overdue.reduce((s, o) => s + o.amount, 0), displayCurrency)}
        valueColor={overdue.length > 0 ? '#B91C1C' : undefined}
      />
      <Tile label="Committed / mo" value={fmtCurrency(committed, displayCurrency)} />
      <Tile label="Net worth" value={fmtCurrency(netWorth?.netWorth ?? 0, displayCurrency)} />
    </Group>
  );
}
