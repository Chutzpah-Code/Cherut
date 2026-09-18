'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Box, Group, Text } from '@mantine/core';
import { useSpendingByCategory } from '@/hooks/useFinance';
import { RowsSkeleton } from './skeletons';

function fmt(value: number, locale: string, currency = 'USD') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

const LABEL: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#0F172A' };
const PALETTE = ['#9DB8F2', '#AFC5F3', '#C2D2F6', '#D3DEF8', '#E1E6EC', '#EDF1F6'];

export function SpendingThisMonth() {
  const t = useTranslations('dashboard.spendingThisMonth');
  const locale = useLocale();
  const [currency] = useState<string>(() => {
    try { return localStorage.getItem('finance_display_currency') ?? 'USD'; } catch { return 'USD'; }
  });
  const { data, isLoading } = useSpendingByCategory(undefined, currency);

  const rows = useMemo(() => {
    if (!data) return [];
    const all = [...data.categories]
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .map((c) => ({ name: c.name, spent: c.spent, pctOfBudget: c.budgetAmount ? Math.round((c.spent / c.budgetAmount) * 100) : null }));
    if (data.uncategorized.spent > 0) {
      all.push({ name: t('uncategorized'), spent: data.uncategorized.spent, pctOfBudget: null });
    }
    return all;
  }, [data, t]);

  const hasData = rows.length > 0;

  return (
    <Box style={{ padding: '24px 28px 28px' }}>
      <Group justify="space-between" align="baseline">
        <Text style={LABEL}>{t('title')}</Text>
        <Link href="/dashboard/finance" style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', textDecoration: 'none' }}>{t('financeLink')}</Link>
      </Group>
      <Text style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 18px' }}>
        {data ? t('subtitleWithTotals', { spent: fmt(data.spentTotal, locale, currency), planned: fmt(data.plannedTotal, locale, currency) }) : t('subtitle')}
      </Text>

      {isLoading ? (
        <RowsSkeleton rows={4} height={18} />
      ) : !hasData ? (
        <Text size="sm" c="dimmed">{t('empty')}</Text>
      ) : (
        <>
          <Box
            role="img"
            aria-label={`${t('title')}: ${rows.map((r) => `${r.name} ${fmt(r.spent, locale, currency)}`).join(', ')}`}
            style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 1, marginBottom: 16 }}
          >
            {rows.map((row, i) => (
              <Box key={row.name} style={{ width: `${(row.spent / (data?.spentTotal || 1)) * 100}%`, background: PALETTE[i % PALETTE.length] }} />
            ))}
          </Box>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '10px 32px' }}>
            {rows.map((row, i) => (
              <Group key={row.name} gap={9} wrap="nowrap">
                <Box style={{ width: 10, height: 10, borderRadius: 2, background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                <Text style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.name}
                </Text>
                <Text style={{ fontSize: 12.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {fmt(row.spent, locale, currency)}
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', width: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {row.pctOfBudget != null ? `${row.pctOfBudget}%` : '—'}
                </Text>
              </Group>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
