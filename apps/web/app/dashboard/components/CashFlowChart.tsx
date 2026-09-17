'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Group, Text } from '@mantine/core';
import { useCashFlow } from '@/hooks/useFinance';
import { ChartSkeleton } from './skeletons';

const LABEL: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#0F172A' };

export function CashFlowChart() {
  const [currency] = useState<string>(() => {
    try { return localStorage.getItem('finance_display_currency') ?? 'USD'; } catch { return 'USD'; }
  });
  const { data, isLoading } = useCashFlow(6, currency);
  const months = data?.months ?? [];
  const hasData = months.some((m) => m.income > 0 || m.expenses > 0);
  const maxValue = Math.max(1, ...months.map((m) => Math.max(m.income, m.expenses)));

  return (
    <Box style={{ padding: '24px 28px 26px' }}>
      <Group justify="space-between" align="baseline">
        <Text style={LABEL}>Cash flow</Text>
        <Link href="/dashboard/finance" style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', textDecoration: 'none' }}>Finance</Link>
      </Group>
      <Text style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 18px' }}>From transactions · income vs expenses · 6 months</Text>

      {isLoading ? (
        <ChartSkeleton height={96} />
      ) : !hasData ? (
        <Text size="sm" c="dimmed">No transactions in the last 6 months.</Text>
      ) : (
        <>
          <Box
            role="img"
            aria-label={`Cash flow over the last 6 months, positive in ${data?.positiveMonths ?? 0} of ${months.length} months`}
            style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 96, paddingBottom: 8, borderBottom: '1px solid #E2E5EB' }}
          >
            {months.map((m, i) => {
              const isLast = i === months.length - 1;
              const incomePct = (m.income / maxValue) * 100;
              const expensesPct = (m.expenses / maxValue) * 100;
              return (
                <Box key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 3, height: '100%' }}>
                  <Box style={{ flex: 1, height: `${incomePct}%`, background: isLast ? '#9DB8F2' : '#C2D2F6', borderRadius: '2px 2px 0 0' }} />
                  <Box style={{ flex: 1, height: `${expensesPct}%`, background: isLast ? '#C9D3E0' : '#E1E6EC', borderRadius: '2px 2px 0 0' }} />
                </Box>
              );
            })}
          </Box>
          <Group gap={10} mt={6}>
            {months.map((m, i) => (
              <Text key={i} style={{ flex: 1, fontSize: 11, color: '#64748B', textAlign: 'center' }}>{m.label}</Text>
            ))}
          </Group>
          <Group align="center" gap={16} mt={16} pt={14} style={{ borderTop: '1px solid #EFF1F5' }}>
            <Group gap={7}>
              <Box style={{ width: 10, height: 10, borderRadius: 2, background: '#C2D2F6' }} />
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>Income</Text>
            </Group>
            <Group gap={7}>
              <Box style={{ width: 10, height: 10, borderRadius: 2, background: '#E1E6EC' }} />
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>Expenses</Text>
            </Group>
            <Box style={{ flex: 1 }} />
            <Text style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B' }}>Positive {data?.positiveMonths ?? 0} of {months.length}</Text>
          </Group>
        </>
      )}
    </Box>
  );
}
