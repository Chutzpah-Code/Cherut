'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Group, Stack, Text, Select, TextInput, NumberInput, Button, Checkbox,
  Center, Modal, Menu, ActionIcon, UnstyledButton,
} from '@mantine/core';
import { Copy, ArrowLeftRight, Paperclip, Download, MoreHorizontal } from 'lucide-react';
import {
  useFinanceTransactionsPaged, useFinanceAccounts, useFinanceCategories,
  useCreateTransaction, useUpdateTransaction, useDeleteTransaction, useUploadReceipt,
  useBulkDeleteTransactions, useBulkRecategorizeTransactions,
} from '@/hooks/useFinance';
import { CreateTransactionDto, FinanceAccount, FinanceTransaction } from '@/lib/api/services/finance';
import { TransactionRow } from './TransactionRow';
import { useAddPanel } from '../add-panel-context';
import { RowsSkeleton } from './skeletons';
import { useUndoableDelete } from '../useUndoableDelete';

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function currentMonth() {
  return localToday().slice(0, 7);
}
function monthOptions() {
  const fmtDate = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = -12; i <= 1; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    options.push({ value, label: fmtDate.format(d) });
  }
  return options.reverse();
}
const MONTH_OPTIONS = monthOptions();

function dayLabel(dateStr: string) {
  const today = localToday();
  const y = new Date(today + 'T00:00:00');
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  if (dateStr === today) return `Today · ${new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  if (dateStr === yesterday) return `Yesterday · ${new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function exportTransactionsCsv(
  rows: FinanceTransaction[],
  accountMap: Record<string, FinanceAccount>,
  categoryMap: Record<string, any>,
  filename: string,
) {
  const header = ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount'];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = rows.map((t) => [
    t.date,
    t.description ?? '',
    t.categoryId ? (categoryMap[t.categoryId]?.name ?? '') : 'Uncategorized',
    accountMap[t.accountId]?.name ?? '',
    t.type,
    String(t.amount),
  ].map((v) => escape(String(v))).join(','));
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ChangeAccountModal({
  opened, onClose, tx, accounts,
}: { opened: boolean; onClose: () => void; tx: FinanceTransaction | null; accounts: FinanceAccount[] }) {
  const updateTx = useUpdateTransaction();
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => { if (opened) setAccountId(tx?.accountId ?? null); }, [opened, tx]);

  const handleSave = () => {
    if (!tx || !accountId) return;
    updateTx.mutate({ id: tx.id, dto: { accountId } }, { onSuccess: onClose });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Change account" centered size="sm">
      <Stack gap="sm">
        <Select
          label="Account"
          data={accounts.map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
          value={accountId}
          onChange={setAccountId}
        />
        <Button onClick={handleSave} loading={updateTx.isPending} disabled={!accountId} style={{ backgroundColor: '#0052CC' }}>
          Save
        </Button>
      </Stack>
    </Modal>
  );
}

export function TransactionsBlock() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [accountFilter, setAccountFilter] = useState<string | null>(searchParams.get('account'));
  const [categoryFilter, setCategoryFilter] = useState<string | null>(searchParams.get('category'));
  const [month, setMonth] = useState<string>(searchParams.get('month') ?? currentMonth());
  const [limit, setLimit] = useState(20);

  // Keep the URL in sync so filters are shareable and survive reload.
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (accountFilter) params.set('account', accountFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    if (month !== currentMonth()) params.set('month', month);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, accountFilter, categoryFilter, month]);

  useEffect(() => { setLimit(20); }, [search, accountFilter, categoryFilter, month]);

  const { data: accounts = [] } = useFinanceAccounts();
  const { data: categories = [] } = useFinanceCategories();
  const accountMap = useMemo(() => Object.fromEntries((accounts as FinanceAccount[]).map((a) => [a.id, a])), [accounts]);
  const categoryMap = useMemo(() => Object.fromEntries(categories.map((c: any) => [c.id, c])), [categories]);

  const pagedParams = useMemo(() => ({
    month,
    accountId: accountFilter ?? undefined,
    categoryId: categoryFilter ?? undefined,
    search: search || undefined,
    offset: 0,
    limit,
  }), [month, accountFilter, categoryFilter, search, limit]);
  const { data, isLoading } = useFinanceTransactionsPaged(pagedParams);

  const deleteTx = useBulkDeleteTransactions();
  const recategorizeTx = useBulkRecategorizeTransactions();
  const uploadReceipt = useUploadReceipt();
  const updateTx = useUpdateTransaction();
  const deleteSingleTx = useDeleteTransaction();
  const undoableDeleteTx = useUndoableDelete((id: string) => deleteSingleTx.mutate(id), { label: 'Transaction' });

  // Quick-add row
  const [quickType, setQuickType] = useState<'expense' | 'income'>('expense');
  const [quickDescription, setQuickDescription] = useState('');
  const [quickCategoryId, setQuickCategoryId] = useState<string | undefined>();
  const [quickAccountId, setQuickAccountId] = useState<string | undefined>();
  const [quickAmount, setQuickAmount] = useState<number | string>('');
  const createTx = useCreateTransaction();

  useEffect(() => {
    if (!quickAccountId && accounts.length > 0) setQuickAccountId((accounts as FinanceAccount[])[0].id);
  }, [accounts, quickAccountId]);

  const quickParsedAmount = typeof quickAmount === 'number' ? quickAmount : parseFloat(quickAmount as string);

  const resetQuickAdd = () => {
    setQuickDescription('');
    setQuickCategoryId(undefined);
    setQuickAmount('');
  };

  const handleQuickSave = () => {
    if (!quickAccountId || isNaN(quickParsedAmount) || quickParsedAmount <= 0) return;
    createTx.mutate(
      {
        accountId: quickAccountId,
        categoryId: quickCategoryId,
        amount: quickParsedAmount,
        type: quickType,
        date: localToday(),
        description: quickDescription || undefined,
      } as CreateTransactionDto,
      { onSuccess: resetQuickAdd },
    );
  };

  // Full form (More fields / edit / duplicate) — all routed through the
  // universal Add panel (Block 5).
  const { openCreate: openAddCreate, openEdit: openAddEdit } = useAddPanel();

  const openMoreFields = () => {
    openAddCreate('transaction', {
      type: quickType,
      accountId: quickAccountId,
      categoryId: quickCategoryId,
      amount: isNaN(quickParsedAmount) ? undefined : quickParsedAmount,
      date: localToday(),
      description: quickDescription || undefined,
    });
  };
  const openEdit = (tx: FinanceTransaction) => openAddEdit('transaction', tx);
  const openDuplicate = (tx: FinanceTransaction) => {
    openAddCreate('transaction', {
      accountId: tx.accountId, categoryId: tx.categoryId, amount: tx.amount,
      type: tx.type, date: localToday(), description: tx.description,
    });
  };

  // Bulk select
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());
  const [recategorizeTarget, setRecategorizeTarget] = useState<string | null>(null);

  const handleBulkDelete = () => {
    deleteTx.mutate(Array.from(selected), { onSuccess: clearSelection });
  };
  const handleBulkRecategorize = () => {
    if (!recategorizeTarget && recategorizeTarget !== '') return;
    recategorizeTx.mutate(
      { ids: Array.from(selected), categoryId: recategorizeTarget === 'uncategorized' ? null : recategorizeTarget },
      { onSuccess: () => { clearSelection(); setRecategorizeTarget(null); } },
    );
  };

  // Change account / attach receipt (row overflow actions)
  const [changeAccountTx, setChangeAccountTx] = useState<FinanceTransaction | null>(null);
  const [receiptTargetId, setReceiptTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachReceiptClick = (tx: FinanceTransaction) => {
    setReceiptTargetId(tx.id);
    fileInputRef.current?.click();
  };
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !receiptTargetId) return;
    const { attachmentUrl } = await uploadReceipt.mutateAsync(file);
    updateTx.mutate({ id: receiptTargetId, dto: { attachmentUrl } });
    setReceiptTargetId(null);
  };

  const items = (data?.items ?? []).filter((t) => !undoableDeleteTx.isPending(t.id));
  const groups = useMemo(() => {
    const map = new Map<string, FinanceTransaction[]>();
    for (const t of items) {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date)!.push(t);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <Box>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileSelected} />

      <Group justify="space-between" align="center" mb="md" wrap="wrap" gap="sm">
        <Text style={{ fontSize: 15, fontWeight: 700 }}>Transactions</Text>
        <Group gap={8} wrap="wrap">
          <TextInput
            size="xs"
            placeholder="Search description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 170 }}
            data-finance-search
          />
          <Select
            size="xs"
            placeholder="All accounts"
            data={(accounts as FinanceAccount[]).map((a) => ({ value: a.id, label: a.name }))}
            value={accountFilter}
            onChange={setAccountFilter}
            clearable
            style={{ minWidth: 140 }}
          />
          <Select
            size="xs"
            placeholder="All categories"
            data={[{ value: 'uncategorized', label: 'Uncategorized' }, ...categories.map((c: any) => ({ value: c.id, label: c.name }))]}
            value={categoryFilter}
            onChange={setCategoryFilter}
            clearable
            style={{ minWidth: 150 }}
          />
          <Select
            size="xs"
            data={MONTH_OPTIONS}
            value={month}
            onChange={(v) => v && setMonth(v)}
            comboboxProps={{ withinPortal: true }}
            style={{ minWidth: 150 }}
          />
          <Button
            size="xs"
            variant="light"
            leftSection={<Download size={13} />}
            onClick={() => exportTransactionsCsv(items, accountMap, categoryMap, `transactions-${month}.csv`)}
            disabled={items.length === 0}
          >
            Export
          </Button>
        </Group>
      </Group>

      {/* Quick add — collapses to a single tappable field on mobile, opening the Add panel */}
      <UnstyledButton
        hiddenFrom="sm"
        onClick={openMoreFields}
        style={{
          display: 'block', width: '100%', background: '#F8FAFC', border: '1px solid #E8EBF0',
          borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13.5, color: '#94A3B8', textAlign: 'left',
        }}
      >
        Quick add
      </UnstyledButton>
      <Box visibleFrom="sm" style={{ background: '#F8FAFC', border: '1px solid #E8EBF0', borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <Group gap={8} wrap="wrap" align="flex-end">
          <Box style={{ display: 'flex', gap: 2, background: '#EDF1F6', borderRadius: 6, padding: 2 }}>
            <UnstyledButton
              onClick={() => setQuickType('expense')}
              style={{
                fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 4,
                background: quickType === 'expense' ? '#FFFFFF' : 'transparent',
                color: quickType === 'expense' ? '#B91C1C' : '#64748B',
              }}
            >
              −
            </UnstyledButton>
            <UnstyledButton
              onClick={() => setQuickType('income')}
              style={{
                fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 4,
                background: quickType === 'income' ? '#FFFFFF' : 'transparent',
                color: quickType === 'income' ? '#15803D' : '#64748B',
              }}
            >
              +
            </UnstyledButton>
          </Box>
          <TextInput
            size="xs"
            placeholder="Quick add — description"
            value={quickDescription}
            onChange={(e) => setQuickDescription(e.target.value)}
            style={{ flex: '1 1 160px', minWidth: 0 }}
          />
          <Select
            size="xs"
            placeholder="Category"
            data={[{ value: 'uncategorized', label: 'Uncategorized' }, ...categories.map((c: any) => ({ value: c.id, label: c.name }))]}
            value={quickCategoryId ?? null}
            onChange={(v) => setQuickCategoryId(v === 'uncategorized' ? undefined : (v ?? undefined))}
            clearable
            style={{ width: 140 }}
          />
          <Select
            size="xs"
            data={(accounts as FinanceAccount[]).map((a) => ({ value: a.id, label: a.name }))}
            value={quickAccountId ?? null}
            onChange={(v) => setQuickAccountId(v ?? undefined)}
            style={{ width: 120 }}
          />
          <NumberInput
            size="xs"
            placeholder="0.00"
            min={0}
            decimalScale={2}
            value={quickAmount}
            onChange={setQuickAmount}
            style={{ width: 110 }}
          />
          <Button size="xs" onClick={handleQuickSave} loading={createTx.isPending} disabled={!quickAccountId || !quickParsedAmount} style={{ backgroundColor: '#0052CC' }}>
            Save
          </Button>
          <UnstyledButton onClick={openMoreFields} style={{ fontSize: 12.5, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            More fields
          </UnstyledButton>
        </Group>
      </Box>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <Group justify="space-between" mb="sm" p="xs" style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 8 }}>
          <Text size="sm" fw={600}>{selected.size} selected</Text>
          <Group gap="xs">
            <Select
              size="xs"
              placeholder="Recategorize to…"
              data={[{ value: 'uncategorized', label: 'Uncategorized' }, ...categories.map((c: any) => ({ value: c.id, label: c.name }))]}
              value={recategorizeTarget}
              onChange={setRecategorizeTarget}
              style={{ width: 160 }}
            />
            <Button size="xs" variant="light" onClick={handleBulkRecategorize} loading={recategorizeTx.isPending} disabled={!recategorizeTarget}>
              Apply
            </Button>
            <Button size="xs" color="red" variant="light" onClick={handleBulkDelete} loading={deleteTx.isPending}>
              Delete
            </Button>
            <Button size="xs" variant="subtle" color="gray" onClick={clearSelection}>Clear</Button>
          </Group>
        </Group>
      )}

      {isLoading ? (
        <RowsSkeleton rows={5} height={48} />
      ) : items.length === 0 ? (
        <Center py="xl"><Text c="dimmed" size="sm">No transactions found for this filter.</Text></Center>
      ) : (
        <Stack gap="md">
          {groups.map(([date, txs]) => (
            <Box key={date}>
              <Text style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', marginBottom: 8 }}>
                {dayLabel(date)}
              </Text>
              <Stack gap={6}>
                {txs.map((tx) => (
                  <Group key={tx.id} gap={8} wrap="nowrap" align="center">
                    <Checkbox size="xs" checked={selected.has(tx.id)} onChange={() => toggleSelect(tx.id)} />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <TransactionRow
                        tx={tx}
                        currency={accountMap[tx.accountId]?.currency}
                        categoryName={tx.categoryId ? categoryMap[tx.categoryId]?.name : undefined}
                        accountName={accountMap[tx.accountId]?.name}
                        onEdit={() => openEdit(tx)}
                        onDelete={() => undoableDeleteTx.remove(tx.id)}
                      />
                    </Box>
                    <Menu shadow="md" width={190} position="bottom-end">
                      <Menu.Target>
                        <ActionIcon size="md" variant="subtle" color="gray"><MoreHorizontal size={16} /></ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<Copy size={14} />} onClick={() => openDuplicate(tx)}>Duplicate</Menu.Item>
                        <Menu.Item leftSection={<ArrowLeftRight size={14} />} onClick={() => setChangeAccountTx(tx)}>Change account</Menu.Item>
                        <Menu.Item leftSection={<Paperclip size={14} />} onClick={() => handleAttachReceiptClick(tx)}>
                          {tx.attachmentUrl ? 'Replace receipt' : 'Attach receipt'}
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<Download size={14} />}
                          onClick={() => exportTransactionsCsv([tx], accountMap, categoryMap, `transaction-${tx.id}.csv`)}
                        >
                          Export
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                ))}
              </Stack>
            </Box>
          ))}

          <Group justify="space-between" pt="md" mt="xs" style={{ borderTop: '1px solid #EFF1F5' }}>
            <Text size="xs" c="dimmed">Showing {items.length} of {data?.total ?? items.length} transactions in {month}</Text>
            {data?.hasMore && (
              <UnstyledButton onClick={() => setLimit((l) => l + 20)} style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
                Load more
              </UnstyledButton>
            )}
          </Group>
        </Stack>
      )}

      <ChangeAccountModal opened={!!changeAccountTx} onClose={() => setChangeAccountTx(null)} tx={changeAccountTx} accounts={accounts as FinanceAccount[]} />
    </Box>
  );
}
