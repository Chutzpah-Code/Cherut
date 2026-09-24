'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Box, Group, Stack, Text, Menu, ActionIcon, UnstyledButton } from '@mantine/core';
import { MoreHorizontal } from 'lucide-react';
import { useDeleteOccurrence, useSkipOccurrence } from '@/hooks/useBills';
import { useFinanceCategories, useUpcomingBillsAndStatements } from '@/hooks/useFinance';
import { fmtCurrency, fmtShortDate } from './billUtils';
import { FinanceBillOccurrence } from '@/lib/api/services/bills';
import { UpcomingBillItem } from '@/lib/api/services/finance';
import { PayOccurrenceModal } from './PayOccurrenceModal';
import { PayCardStatementModal } from './PayCardStatementModal';
import { EditOccurrenceModal } from './EditOccurrenceModal';
import { useAddPanel } from '../../add-panel-context';
import { RowsSkeleton } from '../../components/skeletons';
import { useUndoableDelete } from '../../useUndoableDelete';

const ROW_GRID = '52px minmax(0,1fr) 116px 114px 88px 40px';
const VISIBLE_CAP = 6;

export function UpcomingBills({ horizon }: { horizon: number }) {
  const t = useTranslations('finance.upcomingBills');
  const tc = useTranslations('finance.common');
  const locale = useLocale();
  const { data: rawItems = [], isLoading } = useUpcomingBillsAndStatements(horizon);
  const { data: categories = [] } = useFinanceCategories();
  const deleteOccurrence = useDeleteOccurrence();
  const skipOccurrence = useSkipOccurrence();
  const { openCreate, openEdit } = useAddPanel();
  const undoableDeleteOccurrence = useUndoableDelete((id: string) => deleteOccurrence.mutate(id), { label: tc('occurrence'), resource: 'occurrence' });

  const [payTarget, setPayTarget] = useState<FinanceBillOccurrence | null>(null);
  const [payCardAccountId, setPayCardAccountId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<FinanceBillOccurrence | null>(null);
  const [expanded, setExpanded] = useState(false);

  const categoryMap = Object.fromEntries(categories.map((c: any) => [c.id, c.name]));
  const today = new Date().toISOString().slice(0, 10);
  const list = (rawItems as UpcomingBillItem[]).filter((o) => !undoableDeleteOccurrence.isPending(o.id));
  const visible = expanded ? list : list.slice(0, VISIBLE_CAP);
  const total = list.reduce((s, o) => s + o.amount, 0);

  const handleMarkPaid = (item: UpcomingBillItem) => {
    if (item.isStatement && item.statementAccountId) {
      setPayCardAccountId(item.statementAccountId);
    } else {
      setPayTarget(item as unknown as FinanceBillOccurrence);
    }
  };

  return (
    <Box>
      <Group justify="space-between" align="baseline" mb={4}>
        <Text style={{ fontSize: 15, fontWeight: 700 }}>{t('title')}</Text>
      </Group>
      <Text style={{ fontSize: 12.5, color: '#64748B', marginBottom: 14 }}>
        {t('subtitle', { horizon })}
      </Text>

      {isLoading ? (
        <RowsSkeleton rows={4} height={40} />
      ) : list.length === 0 ? (
        <Box style={{ border: '1px dashed #E2E5EB', borderRadius: 8, padding: 32, textAlign: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{t('noBillsInNext', { horizon })}</Text>
          <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
            {t('createRuleHint')}
          </Text>
          <UnstyledButton
            onClick={() => openCreate('bill')}
            style={{ display: 'inline-block', fontSize: 13.5, fontWeight: 600, color: '#FFFFFF', background: '#0052CC', borderRadius: 6, padding: '9px 16px', cursor: 'pointer' }}
          >
            {t('addBillRule')}
          </UnstyledButton>
        </Box>
      ) : (
        <>
          <Stack gap={1}>
            {visible.map((occ) => {
              const overdue = occ.status === 'overdue';
              const dueToday = occ.dueDate === today;
              return (
                <Box
                  key={occ.id}
                  style={{
                    display: 'grid', gridTemplateColumns: ROW_GRID, alignItems: 'center',
                    gap: 12, padding: '11px 12px', borderRadius: 6,
                    background: overdue ? '#FEF2F2' : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: 700, color: overdue ? '#B91C1C' : dueToday ? '#1D4ED8' : '#64748B' }}>
                    {fmtShortDate(occ.dueDate, locale)}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {occ.bill?.name ?? '—'}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {occ.isStatement ? t('creditCard') : occ.bill ? categoryMap[occ.bill.categoryId ?? ''] ?? '' : ''}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {fmtCurrency(occ.amount, locale)}
                  </Text>
                  {overdue ? (
                    <Text style={{ fontSize: 12, fontWeight: 700, color: '#B91C1C', textAlign: 'right' }}>{t('overdueBadge')}</Text>
                  ) : (
                    <UnstyledButton
                      onClick={() => handleMarkPaid(occ)}
                      style={{ fontSize: 12.5, fontWeight: 600, color: '#1D4ED8', textAlign: 'right', cursor: 'pointer' }}
                    >
                      {t('markPaid')}
                    </UnstyledButton>
                  )}
                  {occ.isStatement ? (
                    <Group gap={6} justify="flex-end">
                      <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => handleMarkPaid(occ)} aria-label={t('payStatementAria')}>
                        <MoreHorizontal size={15} />
                      </ActionIcon>
                    </Group>
                  ) : (
                    <Menu shadow="md" width={190} position="bottom-end">
                      <Menu.Target>
                        <ActionIcon size="sm" variant="subtle" color="gray"><MoreHorizontal size={15} /></ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item onClick={() => handleMarkPaid(occ)}>{t('markPaid')}</Menu.Item>
                        <Menu.Item onClick={() => setEditTarget(occ as unknown as FinanceBillOccurrence)}>{t('editThisOccurrence')}</Menu.Item>
                        <Menu.Item onClick={() => occ.bill && openEdit('bill', occ.bill)}>{t('editRule')}</Menu.Item>
                        <Menu.Item onClick={() => skipOccurrence.mutate(occ.id)}>{t('skipThisOccurrence')}</Menu.Item>
                        <Menu.Item color="red" onClick={() => undoableDeleteOccurrence.remove(occ.id)}>{t('deleteOccurrence')}</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </Box>
              );
            })}
          </Stack>

          <Group justify="space-between" pt="sm" mt="xs" style={{ borderTop: '1px solid #EFF1F5' }}>
            <Text style={{ fontSize: 12.5, color: '#64748B' }}>
              {t('occurrencesTotal', { count: list.length, total: fmtCurrency(total, locale) })}
            </Text>
            {list.length > VISIBLE_CAP && (
              <UnstyledButton onClick={() => setExpanded((v) => !v)} style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
                {expanded ? t('showLess') : t('seeAll')}
              </UnstyledButton>
            )}
          </Group>
        </>
      )}

      <PayOccurrenceModal occurrence={payTarget} opened={!!payTarget} onClose={() => setPayTarget(null)} />
      <PayCardStatementModal opened={!!payCardAccountId} accountId={payCardAccountId} onClose={() => setPayCardAccountId(null)} />
      <EditOccurrenceModal occurrence={editTarget} onClose={() => setEditTarget(null)} />
    </Box>
  );
}
