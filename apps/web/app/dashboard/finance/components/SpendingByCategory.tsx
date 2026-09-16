'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Group, Text, SimpleGrid, Stack, UnstyledButton } from '@mantine/core';
import { useSpendingByCategory, useFinanceBudgets } from '@/hooks/useFinance';
import { useFinanceCurrency } from '../currency-context';
import { useAddPanel } from '../add-panel-context';
import { ManageCategoriesModal } from './ManageCategoriesModal';
import { RowsSkeleton } from './skeletons';

function fmt(value: number, currency?: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD' }).format(value);
  } catch {
    return `${currency ?? ''} ${value.toFixed(2)}`;
  }
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month: string) {
  const [y, m] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
}

export function SpendingByCategory() {
  const { displayCurrency } = useFinanceCurrency();
  const month = currentMonth();
  const { data, isLoading } = useSpendingByCategory(month, displayCurrency);
  const { data: rawBudgets = [] } = useFinanceBudgets(month);
  const { openCreate, openEdit } = useAddPanel();
  const [manageCategoriesOpened, setManageCategoriesOpened] = useState(false);

  const openBudgetFor = (categoryId?: string, budgetId?: string) => {
    if (budgetId) {
      const raw = rawBudgets.find((b: any) => b.id === budgetId);
      if (raw) {
        openEdit('budget', raw);
        return;
      }
    }
    openCreate('budget', categoryId ? { categoryId } : undefined);
  };

  if (isLoading) return <RowsSkeleton rows={4} height={30} />;
  if (!data) return null;

  const hasSpending = data.spentTotal > 0 || data.categories.length > 0;

  return (
    <Box>
      <Group justify="space-between" align="baseline" mb={4} wrap="wrap">
        <Text style={{ fontSize: 15, fontWeight: 700 }}>Spending by category</Text>
        <Group gap="md">
          <UnstyledButton onClick={() => setManageCategoriesOpened(true)} style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
            Manage categories
          </UnstyledButton>
          <UnstyledButton onClick={() => openBudgetFor()} style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
            Set a budget
          </UnstyledButton>
        </Group>
      </Group>

      {!hasSpending ? (
        <Box style={{ border: '1px dashed #E2E5EB', borderRadius: 8, padding: 28, textAlign: 'center', marginTop: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Nothing spent this month</Text>
          <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
            Categories and their budgets appear here once transactions exist.
          </Text>
          <UnstyledButton onClick={() => openBudgetFor()} style={{ display: 'inline-block', fontSize: 13, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
            Set a budget anyway
          </UnstyledButton>
        </Box>
      ) : (
        <>
          <Text style={{ fontSize: 12.5, color: '#64748B', marginBottom: 18 }}>
            {monthLabel(data.month)} · budgets shown inline · {fmt(data.spentTotal, displayCurrency)} of {fmt(data.plannedTotal, displayCurrency)} planned
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={{ base: 14, sm: 40 }} verticalSpacing={14}>
            {data.categories.map((c) => {
              const hasBudget = c.budgetAmount !== undefined;
              const over = hasBudget && c.spent > (c.budgetAmount ?? 0);
              const pct = hasBudget && c.budgetAmount! > 0 ? Math.min(100, (c.spent / c.budgetAmount!) * 100) : 0;
              return (
                <Stack key={c.categoryId} gap={7}>
                  <Group gap={10} align="baseline" wrap="nowrap">
                    <Text style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600 }}>{c.name}</Text>
                    <Text style={{
                      fontSize: 13, fontWeight: over ? 700 : 600, fontVariantNumeric: 'tabular-nums',
                      color: over ? '#B91C1C' : '#0F172A',
                    }}>
                      {fmt(c.spent, displayCurrency)}
                    </Text>
                    {hasBudget ? (
                      <Text style={{ fontSize: 12.5, color: '#64748B', fontVariantNumeric: 'tabular-nums' }}>
                        / {fmt(c.budgetAmount!, displayCurrency)}
                      </Text>
                    ) : (
                      <UnstyledButton onClick={() => openBudgetFor(c.categoryId)} style={{ fontSize: 12.5, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
                        no budget
                      </UnstyledButton>
                    )}
                    {hasBudget && (
                      <UnstyledButton onClick={() => openBudgetFor(c.categoryId, c.budgetId)} style={{ fontSize: 12.5, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
                        Edit
                      </UnstyledButton>
                    )}
                  </Group>
                  {hasBudget && (
                    <Box style={{ height: 8, background: over ? '#FBEAE8' : '#EDF1F6', borderRadius: 4, overflow: 'hidden' }}>
                      <Box style={{ width: `${pct}%`, height: '100%', background: over ? '#F0A8A2' : '#9DB8F2' }} />
                    </Box>
                  )}
                </Stack>
              );
            })}

            {/* Uncategorized is always present, always last, and links into the Transactions
                block's filter. */}
            <Stack gap={7}>
              <Group gap={10} align="baseline" wrap="nowrap">
                <Link href="/dashboard/finance?category=uncategorized" style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                  <Text style={{ fontSize: 14, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>Uncategorized</Text>
                </Link>
                <Text style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(data.uncategorized.spent, displayCurrency)}
                </Text>
              </Group>
              <Box style={{ height: 8, background: '#EDF1F6', borderRadius: 4 }} />
            </Stack>
          </SimpleGrid>
        </>
      )}

      <ManageCategoriesModal opened={manageCategoriesOpened} onClose={() => setManageCategoriesOpened(false)} />
    </Box>
  );
}
