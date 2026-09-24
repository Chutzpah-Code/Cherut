'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Box, Group, Stack, Text, Modal, Select, NumberInput, Button,
  ActionIcon, Collapse, Badge, UnstyledButton,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Pencil, Trash2, Archive, ArchiveRestore, RefreshCw } from 'lucide-react';
import {
  useFinanceAccounts, useUpdateAccount, useDeleteAccount, useRecalculateBalance,
  useCurrentStatement, useStatements, useCloseStatement, usePayStatement,
} from '@/hooks/useFinance';
import { FinanceAccount, FinanceStatement, AccountType } from '@/lib/api/services/finance';
import { useAddPanel } from '../add-panel-context';
import { useFinanceCurrency } from '../currency-context';
import { RowsSkeleton } from './skeletons';

function fmt(value: number, locale: string, currency?: string) {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency ?? 'USD' }).format(value);
  } catch {
    return `${currency ?? ''} ${value.toFixed(2)}`;
  }
}
function fmtDate(iso: string, locale: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}
function fmtBalance(value: number, locale: string, currency?: string) {
  return (value ?? 0) < 0
    ? `−${fmt(Math.abs(value), locale, currency)}`
    : fmt(value, locale, currency);
}

const ROW_GRID = 'minmax(0,1fr) 88px 126px 104px';
// Mobile: the desktop column widths (88 + 126 + 104 = 318px, plus gaps)
// don't leave room for the name column at 375-428px viewports — it gets
// squeezed to ~0 and the (untruncated) name text visually spills onto the
// type chip. Narrower fixed columns on mobile, text truncation below as
// a safety net for any remaining long names.
const ROW_GRID_MOBILE = 'minmax(0,1fr) 58px 84px 100px';

const nameTextStyle: React.CSSProperties = {
  fontSize: 14.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
};
const subTextStyle: React.CSSProperties = {
  fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
};

function TypeChip({ type }: { type: AccountType }) {
  const t = useTranslations('finance.accountsAndCards');
  const TYPE_LABEL: Record<AccountType, string> = {
    checking: t('typeChecking'), wallet: t('typeWallet'), savings: t('typeSavings'), credit: t('typeCredit'), other: t('typeOther'),
  };
  const isCredit = type === 'credit';
  return (
    <Text style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textAlign: 'center',
      borderRadius: 4, padding: '3px 2px',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      color: isCredit ? '#1D4ED8' : '#334155',
      background: isCredit ? '#E4EBFD' : '#F1F5F9',
    }}>
      {TYPE_LABEL[type].toUpperCase()}
    </Text>
  );
}

function RowActions({ onEdit, onArchive, onDelete, onRecalculate, recalculating, archived }: {
  onEdit: () => void; onArchive: () => void; onDelete: () => void; onRecalculate: () => void; recalculating?: boolean; archived?: boolean;
}) {
  const t = useTranslations('finance.accountsAndCards');
  return (
    <Group gap={6} wrap="nowrap" justify="flex-end">
      <ActionIcon size="sm" variant="subtle" color="gray" onClick={onRecalculate} loading={recalculating} aria-label={t('recalculateBalance')} title={t('recalculateBalance')}>
        <RefreshCw size={13} />
      </ActionIcon>
      <ActionIcon size="sm" variant="subtle" color="blue" onClick={onEdit} aria-label={t('editAccount')}>
        <Pencil size={13} />
      </ActionIcon>
      <ActionIcon size="sm" variant="subtle" color="gray" onClick={onArchive} aria-label={archived ? t('unarchiveAccount') : t('archiveAccount')}>
        {archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
      </ActionIcon>
      <ActionIcon size="sm" variant="subtle" color="red" onClick={onDelete} aria-label={t('deleteAccount')}>
        <Trash2 size={13} />
      </ActionIcon>
    </Group>
  );
}

function PayStatementModal({
  opened, onClose, statement, cardAccount, accounts,
}: {
  opened: boolean; onClose: () => void; statement: FinanceStatement; cardAccount: FinanceAccount; accounts: FinanceAccount[];
}) {
  const t = useTranslations('finance.accountsAndCards');
  const locale = useLocale();
  const { displayCurrency: currency } = useFinanceCurrency();
  const payStatement = usePayStatement();
  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | string>(statement.total);
  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount as string);
  const cashAccounts = accounts.filter((a) => a.id !== cardAccount.id && a.type !== 'credit');

  const handlePay = () => {
    if (!fromAccountId || isNaN(parsedAmount) || parsedAmount <= 0) return;
    payStatement.mutate(
      { accountId: cardAccount.id, statementId: statement.id, dto: { fromAccountId, amount: parsedAmount } },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('payStatement')}
      centered
      styles={{
        content: { display: 'flex', flexDirection: 'column', maxHeight: '85dvh', overflow: 'hidden' },
        body: { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 },
      }}
    >
      <Box px="md" py="xs" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        <Stack gap="sm">
          <Box style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 16px' }}>
            <Text size="xs" c="dimmed">{t('statementTotal')}</Text>
            <Text size="xl" fw={700} c="green.7">{fmt(statement.total, locale, currency)}</Text>
            <Text size="xs" c="dimmed">{t('due', { date: fmtDate(statement.dueDate, locale) })}</Text>
          </Box>
          <Select
            label={t('payFrom')}
            placeholder={t('selectAccount')}
            required
            data={cashAccounts.map((a) => ({ value: a.id, label: `${a.name} — ${fmt(a.balance, locale, currency)}` }))}
            value={fromAccountId}
            onChange={setFromAccountId}
          />
          <NumberInput
            label={t('amount')}
            min={0.01}
            decimalScale={2}
            value={amount}
            onChange={setAmount}
            leftSection={<Text size="xs" c="dimmed" fw={600}>{currency}</Text>}
          />
        </Stack>
      </Box>
      <Box px="md" py="sm" style={{ borderTop: '1px solid #E2E8F0', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <Button
          onClick={handlePay}
          loading={payStatement.isPending}
          disabled={!fromAccountId || isNaN(parsedAmount) || parsedAmount <= 0}
          color="green"
          style={{ width: '100%' }}
        >
          {t('confirmPayment')}
        </Button>
      </Box>
    </Modal>
  );
}

function CreditAccountRow({ account, accounts, onEdit, onArchive, onDelete, onRecalculate, recalculating }: {
  account: FinanceAccount; accounts: FinanceAccount[];
  onEdit: () => void; onArchive: () => void; onDelete: () => void; onRecalculate: () => void; recalculating?: boolean;
}) {
  const t = useTranslations('finance.accountsAndCards');
  const locale = useLocale();
  const { displayCurrency: currency } = useFinanceCurrency();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [expanded, setExpanded] = useState(false);
  const [payModal, { open: openPay, close: closePay }] = useDisclosure();
  const [selectedStatement, setSelectedStatement] = useState<FinanceStatement | null>(null);
  const { data: current } = useCurrentStatement(account.id);
  const { data: statements = [] } = useStatements(expanded ? account.id : '');
  const closeStatement = useCloseStatement();

  const used = Math.abs(account.balance ?? 0);
  const limit = account.creditLimit ?? 0;
  const utilization = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <Box>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${account.name} statement details`}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        style={{
          display: 'grid', gridTemplateColumns: isMobile ? ROW_GRID_MOBILE : ROW_GRID, alignItems: 'center',
          gap: isMobile ? 8 : 12, padding: '11px 12px', borderRadius: 6, background: '#F8FAFC', cursor: 'pointer',
        }}
      >
        <Box style={{ minWidth: 0 }}>
          <Text style={nameTextStyle}>{account.name}</Text>
          {current && (
            <Text style={subTextStyle}>
              {t('closesAndDue', { closeDate: fmtDate(current.periodEnd, locale), dueDate: fmtDate(current.dueDate, locale) })}
            </Text>
          )}
          {limit > 0 && (
            <Group gap={8} mt={2} wrap="nowrap">
              <Box style={{ width: 120, height: 4, background: '#EDF1F6', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                <Box style={{ width: `${utilization}%`, height: '100%', background: '#9DB8F2' }} />
              </Box>
              <Text style={{ fontSize: 11.5, color: '#64748B', whiteSpace: 'nowrap' }}>
                {t('ofLimit', { pct: utilization.toFixed(0), limit: fmt(limit, locale, currency) })}
              </Text>
            </Group>
          )}
        </Box>
        <TypeChip type={account.type} />
        <Text style={{
          fontSize: 15, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
          color: (account.balance ?? 0) < 0 ? '#B91C1C' : '#0F172A',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {fmtBalance(account.balance ?? 0, locale, currency)}
        </Text>
        <Box onClick={(e) => e.stopPropagation()}>
          <RowActions onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} onRecalculate={onRecalculate} recalculating={recalculating} archived={account.archived} />
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box p="md" style={{ border: '1px solid #E2E8F0', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          {current && (
            <Group justify="space-between" mb="sm">
              <Box>
                <Text size="xs" c="dimmed">{t('currentStatement')}</Text>
                <Text size="lg" fw={700}>{fmt(current.total, locale, currency)}</Text>
              </Box>
              <Button size="xs" variant="light" onClick={() => closeStatement.mutate(account.id)} loading={closeStatement.isPending}>
                {t('closeStatement')}
              </Button>
            </Group>
          )}
          {statements.length > 0 && (
            <Stack gap={6}>
              <Text size="xs" fw={600} c="dimmed">{t('statementHistory')}</Text>
              {(statements as FinanceStatement[]).map((stmt) => (
                <Group key={stmt.id} justify="space-between" style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px' }}>
                  <Box>
                    <Group gap={6}>
                      <Text size="xs" c="dimmed">{fmtDate(stmt.periodEnd, locale)}</Text>
                      <Badge size="xs" color={stmt.status === 'paid' ? 'green' : stmt.status === 'closed' ? 'orange' : 'blue'} variant="light">
                        {stmt.status === 'paid' ? t('statementPaid') : stmt.status === 'closed' ? t('statementClosed') : t('statementOpen')}
                      </Badge>
                    </Group>
                    <Text size="sm" fw={600}>{fmt(stmt.total, locale, currency)}</Text>
                  </Box>
                  {stmt.status === 'closed' && (
                    <Button size="xs" color="green" variant="light" onClick={() => { setSelectedStatement(stmt); openPay(); }}>
                      {t('pay')}
                    </Button>
                  )}
                </Group>
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>

      {selectedStatement && (
        <PayStatementModal opened={payModal} onClose={closePay} statement={selectedStatement} cardAccount={account} accounts={accounts} />
      )}
    </Box>
  );
}

const ACCOUNT_TYPE_KEY: Record<AccountType, string> = {
  checking: 'typeChecking', wallet: 'typeWallet', savings: 'typeSavings', credit: 'typeCredit', other: 'typeOther',
};

function CashAccountRow({ account, onEdit, onArchive, onDelete, onRecalculate, recalculating }: {
  account: FinanceAccount; onEdit: () => void; onArchive: () => void; onDelete: () => void; onRecalculate: () => void; recalculating?: boolean;
}) {
  const t = useTranslations('finance.accountsAndCards');
  const locale = useLocale();
  const { displayCurrency: currency } = useFinanceCurrency();
  const isMobile = useMediaQuery('(max-width: 767px)');
  return (
    <Box style={{
      display: 'grid', gridTemplateColumns: isMobile ? ROW_GRID_MOBILE : ROW_GRID, alignItems: 'center',
      gap: isMobile ? 8 : 12, padding: '11px 12px', borderRadius: 6,
    }}>
      <Box style={{ minWidth: 0 }}>
        <Text style={nameTextStyle}>{account.name}</Text>
        <Text style={subTextStyle}>
          {t(ACCOUNT_TYPE_KEY[account.type])}
        </Text>
      </Box>
      <TypeChip type={account.type} />
      <Text style={{
        fontSize: 15, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
        color: (account.balance ?? 0) < 0 ? '#B91C1C' : '#0F172A',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {fmtBalance(account.balance ?? 0, locale, currency)}
      </Text>
      <RowActions onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} onRecalculate={onRecalculate} recalculating={recalculating} archived={account.archived} />
    </Box>
  );
}

const ADD_ROW_STYLE: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
  fontSize: 13.5, fontWeight: 600, color: '#1D4ED8',
  border: '1px dashed #CBD5E1', borderRadius: 6, padding: 12, cursor: 'pointer',
};

export function AccountsAndCardsList() {
  const t = useTranslations('finance.accountsAndCards');
  const tc = useTranslations('finance.common');
  const { data: accounts = [], isLoading } = useFinanceAccounts();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const recalculateBalance = useRecalculateBalance();
  const { openCreate, openEdit } = useAddPanel();

  const [deletingAccount, setDeletingAccount] = useState<FinanceAccount | null>(null);
  const [recalculatingId, setRecalculatingId] = useState<string | null>(null);

  if (isLoading) return <RowsSkeleton rows={3} height={52} />;

  const list = accounts as FinanceAccount[];
  const cashAccounts = list.filter((a) => a.type !== 'credit');
  const creditAccounts = list.filter((a) => a.type === 'credit');

  const handleArchive = (account: FinanceAccount) => {
    updateAccount.mutate({ id: account.id, dto: { archived: !account.archived } });
  };

  const handleRecalculate = (account: FinanceAccount) => {
    setRecalculatingId(account.id);
    recalculateBalance.mutate(account.id, {
      onSuccess: () => {
        notifications.show({ message: t('recalculateBalanceSuccess', { name: account.name }) });
      },
      onSettled: () => setRecalculatingId(null),
    });
  };

  return (
    <Box>
      <Group justify="space-between" align="baseline" mb="md">
        <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B' }}>
          {t('title')}
        </Text>
        <UnstyledButton onClick={() => openCreate('account')} style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
          {t('addAccount')}
        </UnstyledButton>
      </Group>

      {list.length === 0 ? (
        <UnstyledButton onClick={() => openCreate('account')} style={ADD_ROW_STYLE}>
          {t('addAccountEmpty')}
        </UnstyledButton>
      ) : (
        <Stack gap={4}>
          {cashAccounts.map((account) => (
            <CashAccountRow
              key={account.id}
              account={account}
              onEdit={() => openEdit('account', account)}
              onArchive={() => handleArchive(account)}
              onDelete={() => setDeletingAccount(account)}
              onRecalculate={() => handleRecalculate(account)}
              recalculating={recalculatingId === account.id}
            />
          ))}
          {creditAccounts.map((account) => (
            <CreditAccountRow
              key={account.id}
              account={account}
              accounts={list}
              onEdit={() => openEdit('account', account)}
              onArchive={() => handleArchive(account)}
              onDelete={() => setDeletingAccount(account)}
              onRecalculate={() => handleRecalculate(account)}
              recalculating={recalculatingId === account.id}
            />
          ))}
          <UnstyledButton onClick={() => openCreate('account')} style={{ ...ADD_ROW_STYLE, marginTop: 6, fontSize: 12.5, padding: 10 }}>
            {t('addAccountEmpty')}
          </UnstyledButton>
        </Stack>
      )}

      <Modal opened={!!deletingAccount} onClose={() => setDeletingAccount(null)} title={t('deleteAccountTitle')} centered size="sm">
        <Stack gap="md">
          <Text size="sm">
            {t('deleteAccountBody', { name: deletingAccount?.name ?? '' })}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" size="sm" onClick={() => setDeletingAccount(null)}>{tc('cancel')}</Button>
            <Button
              color="red"
              size="sm"
              loading={deleteAccount.isPending}
              onClick={() => {
                if (!deletingAccount) return;
                deleteAccount.mutate(deletingAccount.id, { onSuccess: () => setDeletingAccount(null) });
              }}
            >
              {t('deleteEverything')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
