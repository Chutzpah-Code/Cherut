'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Box, Group, Stack, Text, Menu, ActionIcon, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MoreHorizontal, Copy, Download, History, RefreshCw, PiggyBank } from 'lucide-react';
import { useFinanceInvestments, useInvestmentsSummary, useDeleteInvestment, useFinanceAccounts } from '@/hooks/useFinance';
import { useFinanceCurrency } from '../../currency-context';
import { useAddPanel } from '../../add-panel-context';
import { ASSET_CLASSES, ASSET_CLASS_ORDER, AssetClass } from '@/lib/finance/asset-classes';
import { getAssetClassLabel, getAssetTypeLabel } from '@/lib/finance/asset-classes-i18n';
import { FinanceInvestment } from '@/lib/api/services/finance';
import { fmtCurrency } from './billUtils';
import { UpdateValuationsModal } from './UpdateValuationsModal';
import { ValuationHistoryModal } from './ValuationHistoryModal';
import { RevalueModal } from './RevalueModal';
import { AddContributionModal } from './AddContributionModal';
import { RowsSkeleton } from '../../components/skeletons';
import { useUndoableDelete } from '../../useUndoableDelete';

const CLASS_RAMP: Record<AssetClass, string> = {
  financial: '#9DB8F2', realEstate: '#AFC5F3', vehicles: '#C2D2F6', equipment: '#D3DEF8',
  metals: '#C9D3E0', currency: '#DDE3EA', business: '#E1E6EC', digital: '#EDF1F6',
};

const PRIMARY_CLASSES: AssetClass[] = ['financial', 'realEstate', 'vehicles'];
const ROW_GRID = 'minmax(0,1fr) 176px 148px 84px 104px';

function detailText(
  inv: FinanceInvestment,
  locale: string,
  t: (key: string, values?: Record<string, string | number>) => string,
  currency: string,
): string {
  switch (inv.assetClass) {
    case 'realEstate':
      return [inv.area ? t('detailArea', { area: inv.area }) : null, inv.acquiredDate ? t('detailOwnedSince', { year: inv.acquiredDate.slice(0, 4) }) : null]
        .filter(Boolean).join(' · ') || '—';
    case 'vehicles':
    case 'equipment':
      return [inv.year ? String(inv.year) : null, inv.referenceTable ? t('detailValuation', { table: inv.referenceTable }) : null]
        .filter(Boolean).join(' · ') || '—';
    case 'metals':
    case 'currency':
      return [inv.quantity ? String(inv.quantity) : null, inv.unit].filter(Boolean).join(' ') || '—';
    case 'business':
      return [inv.interestReturn, inv.endsOn ? t('detailDue', { date: inv.endsOn }) : null].filter(Boolean).join(' · ') || '—';
    case 'digital':
      return inv.monthlyRevenue ? t('detailMonthlyRevenue', { amount: fmtCurrency(inv.monthlyRevenue, locale, currency) }) : '—';
    default:
      return inv.acquiredDate ? t('detailAcquired', { date: inv.acquiredDate }) : '—';
  }
}

function changePct(inv: FinanceInvestment): number | null {
  if (!inv.acquiredValue || inv.acquiredValue === 0) return null;
  return ((inv.currentValue - inv.acquiredValue) / inv.acquiredValue) * 100;
}

const VALID_CLASSES = new Set(ASSET_CLASS_ORDER as string[]);

export function PortfolioSection() {
  const t = useTranslations('finance.portfolioSection');
  const tc = useTranslations('finance.common');
  const locale = useLocale();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { displayCurrency } = useFinanceCurrency();
  const { data: investments = [], isLoading } = useFinanceInvestments();
  const { data: summary } = useInvestmentsSummary();
  const { data: accounts = [] } = useFinanceAccounts();
  const deleteInvestment = useDeleteInvestment();
  const undoableDeleteInvestment = useUndoableDelete((id: string) => deleteInvestment.mutate(id), { label: tc('asset'), resource: 'investment' });
  const { openCreate, openEdit } = useAddPanel();

  const classParam = searchParams.get('class');
  const filter: 'all' | AssetClass = classParam && VALID_CLASSES.has(classParam) ? (classParam as AssetClass) : 'all';
  const setFilter = (value: 'all' | AssetClass) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') params.delete('class');
    else params.set('class', value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const [expanded, setExpanded] = useState(false);
  const [valuationsOpened, setValuationsOpened] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<FinanceInvestment | null>(null);
  const [revalueTarget, setRevalueTarget] = useState<FinanceInvestment | null>(null);
  const [contributionTarget, setContributionTarget] = useState<FinanceInvestment | null>(null);

  const list = (investments as FinanceInvestment[]).filter((inv) => !undoableDeleteInvestment.isPending(inv.id));
  const accountMap = Object.fromEntries((accounts as any[]).map((a) => [a.id, a]));

  const byClass = useMemo(() => {
    const map = new Map<AssetClass, FinanceInvestment[]>();
    for (const inv of list) {
      const arr = map.get(inv.assetClass) ?? [];
      arr.push(inv);
      map.set(inv.assetClass, arr);
    }
    return map;
  }, [list]);

  const classesPresent = summary?.classes.map((c) => c.assetClass) ?? [];
  const visibleClasses = filter !== 'all'
    ? [filter]
    : expanded
      ? classesPresent
      : classesPresent.filter((c) => PRIMARY_CLASSES.includes(c as AssetClass)).length > 0
        ? classesPresent.filter((c) => PRIMARY_CLASSES.includes(c as AssetClass))
        : classesPresent.slice(0, 3);
  const hiddenCount = classesPresent.length - visibleClasses.length;

  if (isLoading) return <RowsSkeleton rows={4} height={48} />;

  return (
    <Box>
      <Group justify="space-between" align="baseline" wrap="wrap" gap="md">
        <Box>
          <Text style={{ fontSize: 15, fontWeight: 700 }}>{t('title')}</Text>
          {summary && (
            <Text style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>
              {t('summary', { assetCount: summary.assetCount, classCount: summary.classes.length, total: fmtCurrency(summary.totalValue, locale, displayCurrency) })}
            </Text>
          )}
        </Box>
        <UnstyledButton onClick={() => openCreate('investment')} style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
          {t('addAsset')}
        </UnstyledButton>
      </Group>

      {list.length === 0 ? (
        <Box style={{ border: '1px dashed #E2E5EB', borderRadius: 8, padding: 28, textAlign: 'center', marginTop: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{t('noAssets')}</Text>
          <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
            {t('trackHint')}
          </Text>
          <UnstyledButton onClick={() => openCreate('investment')} style={{ display: 'inline-block', fontSize: 13, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
            {t('addFirstAsset')}
          </UnstyledButton>
        </Box>
      ) : (
        <>
          {summary && summary.classes.length > 0 && (
            <>
              <Box style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 1, margin: '20px 0 16px' }}>
                {summary.classes.map((c) => (
                  <Box key={c.assetClass} style={{ width: `${c.pct}%`, background: CLASS_RAMP[c.assetClass as AssetClass] }} />
                ))}
              </Box>
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px 32px', paddingBottom: 20, borderBottom: '1px solid #E2E5EB' }}>
                {summary.classes.map((c) => (
                  <Group key={c.assetClass} gap={9} wrap="nowrap">
                    <Box style={{ width: 10, height: 10, borderRadius: 2, background: CLASS_RAMP[c.assetClass as AssetClass], flexShrink: 0 }} />
                    <Text style={{ flex: 1, minWidth: 0, fontSize: 12.5 }}>{getAssetClassLabel(c.assetClass as AssetClass, c.label, locale)}</Text>
                    <Text style={{ fontSize: 12.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtCurrency(c.value, locale, displayCurrency)}</Text>
                    <Text style={{ fontSize: 12, color: '#64748B', width: 42, textAlign: 'right' }}>{c.pct.toFixed(1)}%</Text>
                  </Group>
                ))}
              </Box>
            </>
          )}

          <Group justify="space-between" wrap="wrap" gap={10} style={{ padding: '18px 0 6px' }}>
            <Group gap={6} wrap="nowrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 2 }}>
              <ClassChip label={t('allAssets')} active={filter === 'all'} onClick={() => setFilter('all')} />
              {ASSET_CLASS_ORDER.filter((c) => byClass.has(c)).map((c) => (
                <ClassChip key={c} label={getAssetClassLabel(c, ASSET_CLASSES[c].label, locale)} active={filter === c} onClick={() => setFilter(c)} />
              ))}
            </Group>
            <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
              <UnstyledButton onClick={() => exportAll(list)} style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', border: '1px solid #E2E5EB', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {t('exportAll')}
              </UnstyledButton>
              <UnstyledButton onClick={() => setValuationsOpened(true)} style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', border: '1px solid #E2E5EB', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {t('updateValuations')}
              </UnstyledButton>
            </Group>
          </Group>

          {visibleClasses.map((c) => {
            const assets = byClass.get(c as AssetClass) ?? [];
            const classValue = summary?.classes.find((s) => s.assetClass === c)?.value ?? 0;
            return (
              <Box key={c} style={{ borderTop: '1px solid #EFF1F5' }}>
                {isMobile ? (
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, padding: '18px 12px 8px' }}>
                    <Group gap={8} align="baseline" wrap="wrap">
                      <Text style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#334155' }}>
                        {getAssetClassLabel(c as AssetClass, ASSET_CLASSES[c as AssetClass].label, locale)}
                      </Text>
                      <Text style={{ fontSize: 11.5, fontWeight: 600, color: '#64748B' }}>{t('assetCount', { count: assets.length })}</Text>
                    </Group>
                    <Text style={{ fontSize: 12.5, fontWeight: 700, textAlign: 'right', color: '#334155', flexShrink: 0 }}>{fmtCurrency(classValue, locale, displayCurrency)}</Text>
                  </Box>
                ) : (
                  <Box style={{ display: 'grid', gridTemplateColumns: ROW_GRID, alignItems: 'baseline', gap: 14, padding: '18px 12px 8px' }}>
                    <Group gap={10} align="baseline">
                      <Text style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#334155' }}>
                        {getAssetClassLabel(c as AssetClass, ASSET_CLASSES[c as AssetClass].label, locale)}
                      </Text>
                      <Text style={{ fontSize: 11.5, fontWeight: 600, color: '#64748B' }}>{t('assetCount', { count: assets.length })}</Text>
                    </Group>
                    <Box />
                    <Text style={{ fontSize: 12.5, fontWeight: 700, textAlign: 'right', color: '#334155' }}>{fmtCurrency(classValue, locale, displayCurrency)}</Text>
                    <Box /><Box />
                  </Box>
                )}
                {assets.map((inv) => {
                  const pct = changePct(inv);
                  const menu = (
                    <Menu shadow="md" width={180} position="bottom-end">
                      <Menu.Target>
                        <ActionIcon size="sm" variant="subtle" color="gray"><MoreHorizontal size={15} /></ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item onClick={() => openEdit('investment', inv)}>{t('edit')}</Menu.Item>
                        <Menu.Item leftSection={<RefreshCw size={14} />} onClick={() => setRevalueTarget(inv)}>{t('revalue')}</Menu.Item>
                        {inv.assetClass === 'financial' && (
                          <Menu.Item leftSection={<PiggyBank size={14} />} onClick={() => setContributionTarget(inv)}>{t('addContribution')}</Menu.Item>
                        )}
                        <Menu.Item leftSection={<History size={14} />} onClick={() => setHistoryTarget(inv)}>{t('valuationHistory')}</Menu.Item>
                        <Menu.Item leftSection={<Copy size={14} />} onClick={() => openCreate('investment', { ...inv, name: `${inv.name} (copy)`, id: undefined })}>{t('duplicate')}</Menu.Item>
                        <Menu.Item leftSection={<Download size={14} />} onClick={() => exportOne(inv)}>{t('export')}</Menu.Item>
                        <Menu.Item color="red" onClick={() => undoableDeleteInvestment.remove(inv.id)}>{t('delete')}</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  );

                  if (isMobile) {
                    return (
                      <Box key={inv.id} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 12px', borderRadius: 6 }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Text style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.name}</Text>
                          <Text style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                            {fmtCurrency(inv.currentValue, locale, displayCurrency)}
                          </Text>
                          {menu}
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Text style={{ flex: 1, minWidth: 0, fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {getAssetTypeLabel(inv.assetType, locale)}{inv.linkedAccountId && accountMap[inv.linkedAccountId] ? ` · ${accountMap[inv.linkedAccountId].name}` : ''}
                          </Text>
                          <Text style={{
                            fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                            color: pct === null ? '#64748B' : pct >= 0 ? '#15803D' : '#B91C1C',
                          }}>
                            {pct === null ? '—' : `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`}
                          </Text>
                        </Box>
                      </Box>
                    );
                  }

                  return (
                    <Box key={inv.id} style={{ display: 'grid', gridTemplateColumns: ROW_GRID, alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 6 }}>
                      <Box style={{ minWidth: 0 }}>
                        <Text style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.name}</Text>
                        <Text style={{ fontSize: 12, color: '#64748B' }}>
                          {getAssetTypeLabel(inv.assetType, locale)}{inv.linkedAccountId && accountMap[inv.linkedAccountId] ? ` · ${accountMap[inv.linkedAccountId].name}` : ''}
                        </Text>
                      </Box>
                      <Text style={{ fontSize: 12.5, color: '#64748B' }}>{detailText(inv, locale, t, displayCurrency)}</Text>
                      <Text style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {fmtCurrency(inv.currentValue, locale, displayCurrency)}
                      </Text>
                      <Text style={{
                        fontSize: 12.5, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                        color: pct === null ? '#64748B' : pct >= 0 ? '#15803D' : '#B91C1C',
                      }}>
                        {pct === null ? '—' : `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`}
                      </Text>
                      <Group gap={6} justify="flex-end" wrap="nowrap">
                        {menu}
                      </Group>
                    </Box>
                  );
                })}
              </Box>
            );
          })}

          {filter === 'all' && hiddenCount > 0 && (
            <UnstyledButton
              onClick={() => setExpanded(true)}
              style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, padding: 12, border: '1px solid #E2E5EB', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}
            >
              {t('loadMore', { count: hiddenCount })}
            </UnstyledButton>
          )}
          {filter === 'all' && expanded && classesPresent.length > PRIMARY_CLASSES.length && (
            <UnstyledButton
              onClick={() => setExpanded(false)}
              style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, padding: 12, border: '1px solid #E2E5EB', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#334155' }}
            >
              {t('showLess')}
            </UnstyledButton>
          )}
        </>
      )}

      <UpdateValuationsModal opened={valuationsOpened} onClose={() => setValuationsOpened(false)} investments={list} />
      <ValuationHistoryModal investment={historyTarget} onClose={() => setHistoryTarget(null)} />
      <RevalueModal investment={revalueTarget} onClose={() => setRevalueTarget(null)} />
      <AddContributionModal investment={contributionTarget} onClose={() => setContributionTarget(null)} />
    </Box>
  );
}

function ClassChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <UnstyledButton
      onClick={onClick}
      aria-pressed={active}
      style={{
        fontSize: 12.5, fontWeight: 600, padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
        whiteSpace: 'nowrap', flexShrink: 0,
        color: active ? '#1D4ED8' : '#334155',
        background: active ? '#E4EBFD' : '#F1F5F9',
      }}
    >
      {label}
    </UnstyledButton>
  );
}

function investmentsToCsv(rows: FinanceInvestment[]): string {
  const header = ['Name', 'Class', 'Type', 'Current value', 'Currency', 'Liquidity', 'Acquired value', 'Acquired date', 'Valued date'];
  const lines = rows.map((inv) => [
    inv.name, inv.assetClass, inv.assetType, String(inv.currentValue), inv.currency, inv.liquidity,
    inv.acquiredValue !== undefined ? String(inv.acquiredValue) : '', inv.acquiredDate ?? '', inv.valuedDate,
  ]);
  return [header, ...lines].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportOne(inv: FinanceInvestment) {
  downloadCsv(investmentsToCsv([inv]), `asset-${inv.id}.csv`);
}

function exportAll(investments: FinanceInvestment[]) {
  downloadCsv(investmentsToCsv(investments), `portfolio-${new Date().toISOString().slice(0, 10)}.csv`);
}
