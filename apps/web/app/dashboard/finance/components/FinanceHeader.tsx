'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, Group, Stack, Title, UnstyledButton, Select, ActionIcon, Tooltip } from '@mantine/core';
import { Plus, Download } from 'lucide-react';
import { useFinanceCurrency } from '../currency-context';
import { useAddPanel } from '../add-panel-context';
import { useFinanceOverview, useExportBackup } from '@/hooks/useFinance';
import { useFinanceShortcuts } from '../useFinanceShortcuts';

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'BRL', 'JPY', 'ARS'];

function PageSwitcher({ pathname, fullWidth }: { pathname: string; fullWidth?: boolean }) {
  const t = useTranslations('finance.header');
  const TABS = [
    { href: '/dashboard/finance', label: t('tabMoney') },
    { href: '/dashboard/finance/portfolio', label: t('tabBillsPortfolio') },
  ];
  return (
    <Box style={{ display: 'flex', gap: 2, background: '#F1F5F9', borderRadius: 8, padding: 3, width: fullWidth ? '100%' : undefined }}>
      {TABS.map((tab) => {
        const isActive = tab.href === '/dashboard/finance'
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none', flex: fullWidth ? 1 : undefined }}>
            <Box
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 6,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                textAlign: fullWidth ? 'center' : undefined,
                color: isActive ? '#0F172A' : '#64748B',
                background: isActive ? '#FFFFFF' : 'transparent',
                boxShadow: isActive ? '0 1px 2px rgba(15,23,42,.08)' : 'none',
              }}
            >
              {tab.label}
            </Box>
          </Link>
        );
      })}
    </Box>
  );
}

export function FinanceHeader() {
  const t = useTranslations('finance.header');
  const pathname = usePathname();
  const { displayCurrency, setDisplayCurrency } = useFinanceCurrency();
  const { data: overview } = useFinanceOverview(undefined, displayCurrency);
  const { openCreate } = useAddPanel();
  const exportBackup = useExportBackup();
  useFinanceShortcuts();

  const currencyOptions = overview
    ? Array.from(new Set([...Object.keys(overview.balanceByCurrency), ...CURRENCY_OPTIONS]))
    : CURRENCY_OPTIONS;

  const handleExportBackup = () => {
    exportBackup.mutate(undefined, {
      onSuccess: (result) => {
        const json = JSON.stringify(result, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cherut-finance-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
    });
  };

  const currencySelect = (
    <Select
      data={currencyOptions}
      value={displayCurrency}
      onChange={(v) => v && setDisplayCurrency(v)}
      size="xs"
      w={90}
      comboboxProps={{ withinPortal: true }}
      styles={{ input: { fontSize: 13, fontWeight: 600, color: '#334155', border: '1px solid #E2E8F0' } }}
    />
  );

  const exportButton = (
    <Tooltip label={t('exportBackup')}>
      <ActionIcon
        variant="default"
        size="lg"
        onClick={handleExportBackup}
        loading={exportBackup.isPending}
        aria-label={t('exportBackup')}
      >
        <Download size={15} />
      </ActionIcon>
    </Tooltip>
  );

  return (
    <>
      {/* ≥768px: everything in one row */}
      <Group justify="space-between" align="center" wrap="wrap" gap="sm" mb="lg" visibleFrom="sm">
        <Title order={1} style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.015em' }}>
          {t('title')}
        </Title>
        <Group gap="xs" wrap="wrap" className="finance-no-print">
          <PageSwitcher pathname={pathname} />
          {currencySelect}
          {exportButton}
          <UnstyledButton
            onClick={() => openCreate('transaction')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600,
              color: '#FFFFFF', background: '#0052CC', borderRadius: 6, padding: '9px 14px',
            }}
          >
            <Plus size={15} /> {t('add')}
          </UnstyledButton>
        </Group>
      </Group>

      {/* <768px: title + controls row, then a full-width page switcher below; +Add becomes a FAB */}
      <Stack gap="sm" mb="lg" hiddenFrom="sm">
        <Group justify="space-between" align="center">
          <Title order={1} style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.015em' }}>
            {t('title')}
          </Title>
          <Group gap="xs" className="finance-no-print">
            {currencySelect}
            {exportButton}
          </Group>
        </Group>
        <PageSwitcher pathname={pathname} fullWidth />
      </Stack>

      <ActionIcon
        hiddenFrom="sm"
        className="finance-no-print"
        onClick={() => openCreate('transaction')}
        aria-label={t('add')}
        radius="xl"
        size={56}
        style={{
          position: 'fixed', bottom: 'max(20px, env(safe-area-inset-bottom))', right: 20, zIndex: 200,
          backgroundColor: '#0052CC', boxShadow: '0 4px 14px rgba(0,82,204,.35)',
        }}
      >
        <Plus size={24} color="#FFFFFF" />
      </ActionIcon>
    </>
  );
}
