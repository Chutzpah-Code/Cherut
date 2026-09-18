'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Box, Group, Stack, Text, ActionIcon, UnstyledButton } from '@mantine/core';
import { Pencil, Trash2, Pause, Play } from 'lucide-react';
import { useBills, useDeleteBill, usePauseBill, useResumeBill } from '@/hooks/useBills';
import { useFinanceAccounts } from '@/hooks/useFinance';
import { FinanceBill } from '@/lib/api/services/bills';
import { monthlyEquivalent, fmtCurrency } from './billUtils';
import { useAddPanel } from '../../add-panel-context';
import { RowsSkeleton } from '../../components/skeletons';
import { useUndoableDelete } from '../../useUndoableDelete';

const ROW_GRID = 'minmax(0,1fr) 84px 100px 68px 96px';

export function RecurringList() {
  const t = useTranslations('finance.recurringList');
  const tc = useTranslations('finance.common');
  const locale = useLocale();
  const FREQUENCY_LABEL: Record<string, string> = {
    weekly: tc('freqWeekly'), biweekly: tc('freqBiweekly'), monthly: tc('freqMonthly'), bimonthly: tc('freqBimonthly'),
    quarterly: tc('freqQuarterly'), semiannual: tc('freqSemiannual'), annual: tc('freqAnnual'), custom: tc('freqCustom'),
  };
  const { data: rawBills = [], isLoading } = useBills();
  const { data: accounts = [] } = useFinanceAccounts();
  const deleteBill = useDeleteBill();
  const pauseBill = usePauseBill();
  const resumeBill = useResumeBill();
  const { openCreate, openEdit } = useAddPanel();
  const undoableDeleteBill = useUndoableDelete((id: string) => deleteBill.mutate(id), { label: tc('rule') });

  const accountMap = Object.fromEntries((accounts as any[]).map((a) => [a.id, a]));
  const list = (rawBills as FinanceBill[]).filter((b) => !undoableDeleteBill.isPending(b.id));
  const monthlyTotal = list.filter((b) => b.isActive).reduce((s, b) => s + monthlyEquivalent(b), 0);

  return (
    <Box>
      <Group justify="space-between" align="baseline" mb={4}>
        <Text style={{ fontSize: 15, fontWeight: 700 }}>{t('title')}</Text>
        <UnstyledButton onClick={() => openCreate('bill')} style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
          {t('addRule')}
        </UnstyledButton>
      </Group>
      <Text style={{ fontSize: 12.5, color: '#64748B', marginBottom: 14 }}>
        {t('subtitle', { total: fmtCurrency(monthlyTotal, locale) })}
      </Text>

      {isLoading ? (
        <RowsSkeleton rows={3} height={38} />
      ) : list.length === 0 ? (
        <Box style={{ border: '1px dashed #E2E5EB', borderRadius: 8, padding: 24, textAlign: 'center' }}>
          <Text style={{ fontSize: 13, color: '#64748B' }}>{t('noRules')}</Text>
        </Box>
      ) : (
        <Stack gap={0}>
          {list.map((bill) => {
            const currency = accountMap[bill.accountId]?.currency;
            return (
              <Box
                key={bill.id}
                style={{
                  display: 'grid', gridTemplateColumns: ROW_GRID, alignItems: 'center',
                  gap: 10, padding: '11px 0', borderBottom: '1px solid #EFF1F5',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {bill.name}
                </Text>
                <Text style={{ fontSize: 11.5, fontWeight: 600, color: '#64748B' }}>
                  {FREQUENCY_LABEL[bill.frequency] ?? bill.frequency}
                </Text>
                <Text style={{ fontSize: 13.5, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtCurrency(bill.amount, locale, currency)}
                </Text>
                <Text style={{
                  fontSize: 11, fontWeight: 700, textAlign: 'center', borderRadius: 4, padding: '3px 0',
                  color: bill.isActive ? '#15803D' : '#64748B',
                  background: bill.isActive ? '#F0FDF4' : '#F1F5F9',
                }}>
                  {bill.isActive ? t('active') : t('paused')}
                </Text>
                <Group gap={6} justify="flex-end" wrap="nowrap">
                  <ActionIcon
                    size="sm" variant="subtle" color="gray"
                    onClick={() => (bill.isActive ? pauseBill.mutate(bill.id) : resumeBill.mutate(bill.id))}
                    aria-label={bill.isActive ? t('pauseRule') : t('resumeRule')}
                  >
                    {bill.isActive ? <Pause size={13} /> : <Play size={13} />}
                  </ActionIcon>
                  <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => openEdit('bill', bill)}>
                    <Pencil size={13} />
                  </ActionIcon>
                  <ActionIcon size="sm" variant="subtle" color="red" onClick={() => undoableDeleteBill.remove(bill.id)}>
                    <Trash2 size={13} />
                  </ActionIcon>
                </Group>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
