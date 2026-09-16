'use client';

import { useState } from 'react';
import {
  Box, Group, Stack, Text, Modal, Select, NumberInput, Button,
  ActionIcon, Collapse, Badge, UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Pencil, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import {
  useFinanceAccounts, useUpdateAccount, useDeleteAccount,
  useCurrentStatement, useStatements, useCloseStatement, usePayStatement,
} from '@/hooks/useFinance';
import { FinanceAccount, FinanceStatement, AccountType } from '@/lib/api/services/finance';
import { useAddPanel } from '../add-panel-context';
import { RowsSkeleton } from './skeletons';

function fmt(value: number, currency?: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD' }).format(value);
  } catch {
    return `${currency ?? ''} ${value.toFixed(2)}`;
  }
}
function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}
function fmtBalance(value: number, currency?: string) {
  return (value ?? 0) < 0
    ? `−${fmt(Math.abs(value), currency)}`
    : fmt(value, currency);
}

const ROW_GRID = 'minmax(0,1fr) 88px 126px 104px';

const TYPE_LABEL: Record<AccountType, string> = {
  checking: 'CHECKING', wallet: 'WALLET', savings: 'SAVINGS', credit: 'CREDIT', other: 'OTHER',
};

function TypeChip({ type }: { type: AccountType }) {
  const isCredit = type === 'credit';
  return (
    <Text style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textAlign: 'center',
      borderRadius: 4, padding: '3px 0',
      color: isCredit ? '#1D4ED8' : '#334155',
      background: isCredit ? '#E4EBFD' : '#F1F5F9',
    }}>
      {TYPE_LABEL[type]}
    </Text>
  );
}

function RowActions({ onEdit, onArchive, onDelete, archived }: {
  onEdit: () => void; onArchive: () => void; onDelete: () => void; archived?: boolean;
}) {
  return (
    <Group gap={6} wrap="nowrap" justify="flex-end">
      <ActionIcon size="sm" variant="subtle" color="blue" onClick={onEdit} aria-label="Edit account">
        <Pencil size={13} />
      </ActionIcon>
      <ActionIcon size="sm" variant="subtle" color="gray" onClick={onArchive} aria-label={archived ? 'Unarchive account' : 'Archive account'}>
        {archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
      </ActionIcon>
      <ActionIcon size="sm" variant="subtle" color="red" onClick={onDelete} aria-label="Delete account">
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
      title="Pay statement"
      centered
      styles={{
        content: { display: 'flex', flexDirection: 'column', maxHeight: '85dvh', overflow: 'hidden' },
        body: { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 },
      }}
    >
      <Box px="md" py="xs" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        <Stack gap="sm">
          <Box style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 16px' }}>
            <Text size="xs" c="dimmed">Statement total</Text>
            <Text size="xl" fw={700} c="green.7">{fmt(statement.total, cardAccount.currency)}</Text>
            <Text size="xs" c="dimmed">Due: {fmtDate(statement.dueDate)}</Text>
          </Box>
          <Select
            label="Pay from"
            placeholder="Select account"
            required
            data={cashAccounts.map((a) => ({ value: a.id, label: `${a.name} — ${fmt(a.balance, a.currency)}` }))}
            value={fromAccountId}
            onChange={setFromAccountId}
          />
          <NumberInput
            label="Amount"
            min={0.01}
            decimalScale={2}
            value={amount}
            onChange={setAmount}
            leftSection={<Text size="xs" c="dimmed" fw={600}>{cardAccount.currency}</Text>}
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
          Confirm payment
        </Button>
      </Box>
    </Modal>
  );
}

function CreditAccountRow({ account, accounts, onEdit, onArchive, onDelete }: {
  account: FinanceAccount; accounts: FinanceAccount[];
  onEdit: () => void; onArchive: () => void; onDelete: () => void;
}) {
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
          display: 'grid', gridTemplateColumns: ROW_GRID, alignItems: 'center',
          gap: 12, padding: '11px 12px', borderRadius: 6, background: '#F8FAFC', cursor: 'pointer',
        }}
      >
        <Box style={{ minWidth: 0 }}>
          <Text style={{ fontSize: 14.5, fontWeight: 600 }}>{account.name}</Text>
          {current && (
            <Text style={{ fontSize: 12, color: '#64748B' }}>
              Closes {fmtDate(current.periodEnd)} · due {fmtDate(current.dueDate)}
            </Text>
          )}
          {limit > 0 && (
            <Group gap={8} mt={2} wrap="nowrap">
              <Box style={{ width: 120, height: 4, background: '#EDF1F6', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                <Box style={{ width: `${utilization}%`, height: '100%', background: '#9DB8F2' }} />
              </Box>
              <Text style={{ fontSize: 11.5, color: '#64748B', whiteSpace: 'nowrap' }}>
                {utilization.toFixed(0)}% of {fmt(limit, account.currency)}
              </Text>
            </Group>
          )}
        </Box>
        <TypeChip type={account.type} />
        <Text style={{
          fontSize: 15, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
          color: (account.balance ?? 0) < 0 ? '#B91C1C' : '#0F172A',
        }}>
          {fmtBalance(account.balance ?? 0, account.currency)}
        </Text>
        <Box onClick={(e) => e.stopPropagation()}>
          <RowActions onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} archived={account.archived} />
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box p="md" style={{ border: '1px solid #E2E8F0', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          {current && (
            <Group justify="space-between" mb="sm">
              <Box>
                <Text size="xs" c="dimmed">Current statement</Text>
                <Text size="lg" fw={700}>{fmt(current.total, account.currency)}</Text>
              </Box>
              <Button size="xs" variant="light" onClick={() => closeStatement.mutate(account.id)} loading={closeStatement.isPending}>
                Close statement
              </Button>
            </Group>
          )}
          {statements.length > 0 && (
            <Stack gap={6}>
              <Text size="xs" fw={600} c="dimmed">Statement history</Text>
              {(statements as FinanceStatement[]).map((stmt) => (
                <Group key={stmt.id} justify="space-between" style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px' }}>
                  <Box>
                    <Group gap={6}>
                      <Text size="xs" c="dimmed">{fmtDate(stmt.periodEnd)}</Text>
                      <Badge size="xs" color={stmt.status === 'paid' ? 'green' : stmt.status === 'closed' ? 'orange' : 'blue'} variant="light">
                        {stmt.status}
                      </Badge>
                    </Group>
                    <Text size="sm" fw={600}>{fmt(stmt.total, account.currency)}</Text>
                  </Box>
                  {stmt.status === 'closed' && (
                    <Button size="xs" color="green" variant="light" onClick={() => { setSelectedStatement(stmt); openPay(); }}>
                      Pay
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

function CashAccountRow({ account, onEdit, onArchive, onDelete }: {
  account: FinanceAccount; onEdit: () => void; onArchive: () => void; onDelete: () => void;
}) {
  return (
    <Box style={{ display: 'grid', gridTemplateColumns: ROW_GRID, alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 6 }}>
      <Box style={{ minWidth: 0 }}>
        <Text style={{ fontSize: 14.5, fontWeight: 600 }}>{account.name}</Text>
        <Text style={{ fontSize: 12, color: '#64748B' }}>
          {account.type.charAt(0).toUpperCase() + account.type.slice(1)} · {account.currency}
        </Text>
      </Box>
      <TypeChip type={account.type} />
      <Text style={{
        fontSize: 15, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
        color: (account.balance ?? 0) < 0 ? '#B91C1C' : '#0F172A',
      }}>
        {fmtBalance(account.balance ?? 0, account.currency)}
      </Text>
      <RowActions onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} archived={account.archived} />
    </Box>
  );
}

const ADD_ROW_STYLE: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
  fontSize: 13.5, fontWeight: 600, color: '#1D4ED8',
  border: '1px dashed #CBD5E1', borderRadius: 6, padding: 12, cursor: 'pointer',
};

export function AccountsAndCardsList() {
  const { data: accounts = [], isLoading } = useFinanceAccounts();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const { openCreate, openEdit } = useAddPanel();

  const [deletingAccount, setDeletingAccount] = useState<FinanceAccount | null>(null);

  if (isLoading) return <RowsSkeleton rows={3} height={52} />;

  const list = accounts as FinanceAccount[];
  const cashAccounts = list.filter((a) => a.type !== 'credit');
  const creditAccounts = list.filter((a) => a.type === 'credit');

  const handleArchive = (account: FinanceAccount) => {
    updateAccount.mutate({ id: account.id, dto: { archived: !account.archived } });
  };

  return (
    <Box>
      <Group justify="space-between" align="baseline" mb="md">
        <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B' }}>
          Accounts &amp; cards
        </Text>
        <UnstyledButton onClick={() => openCreate('account')} style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
          Add account
        </UnstyledButton>
      </Group>

      {list.length === 0 ? (
        <UnstyledButton onClick={() => openCreate('account')} style={ADD_ROW_STYLE}>
          + Add a credit card or account
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
            />
          ))}
          <UnstyledButton onClick={() => openCreate('account')} style={{ ...ADD_ROW_STYLE, marginTop: 6, fontSize: 12.5, padding: 10 }}>
            + Add a credit card or account
          </UnstyledButton>
        </Stack>
      )}

      <Modal opened={!!deletingAccount} onClose={() => setDeletingAccount(null)} title="Delete account?" centered size="sm">
        <Stack gap="md">
          <Text size="sm">
            Deleting <strong>{deletingAccount?.name}</strong> permanently removes the account and all
            transactions linked to it. This cannot be undone — archive it instead if you want to keep the history.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" size="sm" onClick={() => setDeletingAccount(null)}>Cancel</Button>
            <Button
              color="red"
              size="sm"
              loading={deleteAccount.isPending}
              onClick={() => {
                if (!deletingAccount) return;
                deleteAccount.mutate(deletingAccount.id, { onSuccess: () => setDeletingAccount(null) });
              }}
            >
              Delete everything
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
