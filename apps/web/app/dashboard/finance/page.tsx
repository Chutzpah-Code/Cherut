'use client';

import { useState, useMemo } from 'react';
import {
  Stack, Group, Title, Text, Box, SimpleGrid, Card, Badge,
  Button, Loader, Center, UnstyledButton, Modal,
  TextInput, Select, NumberInput, ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  TrendingUp, TrendingDown, Wallet, Plus, Trash2, Pencil,
  ArrowUpCircle, ArrowDownCircle,
} from 'lucide-react';
import {
  useFinanceOverview,
  useFinanceAccounts,
  useFinanceTransactions,
  useFinanceCategories,
  useCreateAccount,
  useDeleteAccount,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useCreateCategory,
} from '@/hooks/useFinance';
import { CreateAccountDto, CreateTransactionDto, CreateCategoryDto, FinanceTransaction, FinanceAccount } from '@/lib/api/services/finance';
import { RecurringView } from './components/RecurringView';
import { BudgetsView } from './components/BudgetsView';
import { InvestmentsView } from './components/InvestmentsView';

type FinanceView = 'overview' | 'transactions' | 'accounts' | 'recurring' | 'budgets' | 'investments';

const TABS: { id: FinanceView; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'recurring', label: 'Recurring' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'investments', label: 'Investments' },
];

function fmt(value: number, currency?: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency ?? 'USD' }).format(value);
  } catch {
    return `${currency ?? ''} ${value.toFixed(2)}`;
  }
}

function TabBar({ current, onChange }: { current: FinanceView; onChange: (v: FinanceView) => void }) {
  return (
    <Box
      style={{
        marginLeft: 'calc(-1 * var(--mantine-spacing-md))',
        marginRight: 'calc(-1 * var(--mantine-spacing-md))',
        paddingLeft: 'var(--mantine-spacing-md)',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: 20,
        backgroundColor: '#ffffff',
      }}
    >
      <Group gap={0}>
        {TABS.map(({ id, label }) => {
          const isActive = current === id;
          return (
            <UnstyledButton
              key={id}
              onClick={() => onChange(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 16px',
                marginBottom: -1,
                borderBottom: isActive ? '2px solid #0052CC' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
                userSelect: 'none',
              }}
            >
              <Text
                size="sm"
                fw={isActive ? 600 : 500}
                style={{ color: isActive ? '#0052CC' : '#42526E', letterSpacing: '-0.01em', lineHeight: 1 }}
              >
                {label}
              </Text>
            </UnstyledButton>
          );
        })}
      </Group>
    </Box>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewView() {
  const { data, isLoading } = useFinanceOverview();
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: categories = [] } = useFinanceCategories();
  const accountMap = useMemo(
    () => Object.fromEntries((accounts as FinanceAccount[]).map((a) => [a.id, a])),
    [accounts],
  );
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c: any) => [c.id, c])),
    [categories],
  );

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;
  if (!data) return null;

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <SummaryCard label="Total Balance" value={data.totalBalance} color="#0052CC" icon={<Wallet size={20} />} />
        <SummaryCard label="Income" value={data.income} color="#2e7d32" icon={<TrendingUp size={20} />} />
        <SummaryCard label="Expenses" value={data.expenses} color="#c62828" icon={<TrendingDown size={20} />} />
      </SimpleGrid>

      {data.recentTransactions.length > 0 && (
        <Box>
          <Text fw={600} size="sm" mb="sm" c="dimmed">Recent Transactions</Text>
          <Stack gap="xs">
            {data.recentTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                currency={accountMap[tx.accountId]?.currency}
                categoryName={categoryMap[tx.categoryId]?.name}
              />
            ))}
          </Stack>
        </Box>
      )}

      {data.recentTransactions.length === 0 && (
        <Center py="xl">
          <Text c="dimmed" size="sm">No transactions this month. Add your first one.</Text>
        </Center>
      )}
    </Stack>
  );
}

function SummaryCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group gap="sm" mb="xs">
        <Box style={{ color }}>{icon}</Box>
        <Text size="sm" c="dimmed" fw={500}>{label}</Text>
      </Group>
      <Text size="xl" fw={700} style={{ color, letterSpacing: '-0.02em' }}>{fmt(value)}</Text>
    </Card>
  );
}

// ─── Transactions ─────────────────────────────────────────────────────────────

const EMPTY_FORM: Partial<CreateTransactionDto> = {
  type: 'expense',
  date: new Date().toISOString().slice(0, 10),
};

function TransactionForm({
  form, setForm, formCurrency, accounts, categories,
  onAccountChange, onSubmit, loading, submitLabel,
}: {
  form: Partial<CreateTransactionDto>;
  setForm: React.Dispatch<React.SetStateAction<Partial<CreateTransactionDto>>>;
  formCurrency: string;
  accounts: FinanceAccount[];
  categories: any[];
  onAccountChange: (id: string | null) => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel: string;
}) {
  return (
    <Stack gap="sm">
      <Select
        label="Type"
        data={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]}
        value={form.type}
        onChange={(v) => setForm((f) => ({ ...f, type: v as any }))}
      />
      <Select
        label="Account"
        data={accounts.map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
        value={form.accountId}
        onChange={onAccountChange}
        placeholder="Select account"
      />
      <Select
        label="Category"
        data={categories.map((c: any) => ({ value: c.id, label: c.name }))}
        value={form.categoryId}
        onChange={(v) => setForm((f) => ({ ...f, categoryId: v ?? undefined }))}
        placeholder="Select category"
      />
      <NumberInput
        label={`Amount (${formCurrency})`}
        min={0}
        decimalScale={2}
        value={form.amount}
        onChange={(v) => setForm((f) => ({ ...f, amount: typeof v === 'number' ? v : undefined }))}
        leftSection={<Text size="xs" c="dimmed" fw={600}>{formCurrency}</Text>}
      />
      <TextInput
        label="Date"
        type="date"
        value={form.date}
        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
      />
      <TextInput
        label="Description"
        placeholder="Optional"
        value={form.description ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || undefined }))}
      />
      <Button
        onClick={onSubmit}
        loading={loading}
        disabled={!form.accountId || !form.categoryId || !form.amount}
        style={{ backgroundColor: '#0052CC' }}
      >
        {submitLabel}
      </Button>
    </Stack>
  );
}

function TransactionsView() {
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure();
  const [editTx, setEditTx] = useState<FinanceTransaction | null>(null);

  // Filters
  const [filterAccount, setFilterAccount] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const txParams = useMemo(() => ({
    accountId: filterAccount ?? undefined,
    type: filterType ?? undefined,
    startDate: filterStart || undefined,
    endDate: filterEnd || undefined,
  }), [filterAccount, filterType, filterStart, filterEnd]);

  const { data: transactions = [], isLoading } = useFinanceTransactions(txParams);
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: categories = [] } = useFinanceCategories();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  const accountMap = useMemo(
    () => Object.fromEntries((accounts as FinanceAccount[]).map((a) => [a.id, a])),
    [accounts],
  );
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c: any) => [c.id, c])),
    [categories],
  );

  const [createForm, setCreateForm] = useState<Partial<CreateTransactionDto>>(EMPTY_FORM);
  const [createCurrency, setCreateCurrency] = useState('USD');
  const [editForm, setEditForm] = useState<Partial<CreateTransactionDto>>({});
  const [editCurrency, setEditCurrency] = useState('USD');

  const handleCreateAccountChange = (accountId: string | null) => {
    const acc = (accounts as FinanceAccount[]).find((a) => a.id === accountId);
    setCreateCurrency(acc?.currency ?? 'USD');
    setCreateForm((f) => ({ ...f, accountId: accountId ?? undefined }));
  };

  const handleEditAccountChange = (accountId: string | null) => {
    const acc = (accounts as FinanceAccount[]).find((a) => a.id === accountId);
    setEditCurrency(acc?.currency ?? 'USD');
    setEditForm((f) => ({ ...f, accountId: accountId ?? undefined }));
  };

  const openEdit = (tx: FinanceTransaction) => {
    setEditTx(tx);
    setEditForm({ accountId: tx.accountId, categoryId: tx.categoryId, amount: tx.amount, type: tx.type, date: tx.date, description: tx.description });
    const acc = accountMap[tx.accountId];
    setEditCurrency(acc?.currency ?? 'USD');
  };

  const handleCreate = () => {
    if (!createForm.accountId || !createForm.categoryId || !createForm.amount || !createForm.type || !createForm.date) return;
    createTx.mutate(createForm as CreateTransactionDto, {
      onSuccess: () => { closeCreate(); setCreateForm(EMPTY_FORM); setCreateCurrency('USD'); },
    });
  };

  const handleEdit = () => {
    if (!editTx) return;
    updateTx.mutate({ id: editTx.id, dto: editForm }, { onSuccess: () => setEditTx(null) });
  };

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  return (
    <>
      <Group justify="space-between" mb="sm">
        <Text fw={600} size="sm" c="dimmed">Transactions</Text>
        <Button size="xs" leftSection={<Plus size={14} />} onClick={openCreate} style={{ backgroundColor: '#0052CC' }}>
          Add
        </Button>
      </Group>

      {/* Filters */}
      <Group gap="xs" mb="md" wrap="wrap">
        <Select
          size="xs"
          placeholder="All accounts"
          data={(accounts as FinanceAccount[]).map((a) => ({ value: a.id, label: a.name }))}
          value={filterAccount}
          onChange={setFilterAccount}
          clearable
          style={{ minWidth: 140 }}
        />
        <Select
          size="xs"
          placeholder="All types"
          data={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]}
          value={filterType}
          onChange={setFilterType}
          clearable
          style={{ minWidth: 120 }}
        />
        <TextInput
          size="xs"
          type="date"
          placeholder="From"
          value={filterStart}
          onChange={(e) => setFilterStart(e.target.value)}
          style={{ width: 140 }}
        />
        <TextInput
          size="xs"
          type="date"
          placeholder="To"
          value={filterEnd}
          onChange={(e) => setFilterEnd(e.target.value)}
          style={{ width: 140 }}
        />
        {(filterAccount || filterType || filterStart || filterEnd) && (
          <Button size="xs" variant="subtle" color="gray" onClick={() => { setFilterAccount(null); setFilterType(null); setFilterStart(''); setFilterEnd(''); }}>
            Clear
          </Button>
        )}
      </Group>

      {transactions.length === 0 ? (
        <Center py="xl"><Text c="dimmed" size="sm">No transactions found.</Text></Center>
      ) : (
        <Stack gap="xs">
          {transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              currency={accountMap[tx.accountId]?.currency}
              categoryName={categoryMap[tx.categoryId]?.name}
              onEdit={() => openEdit(tx)}
              onDelete={() => deleteTx.mutate(tx.id)}
            />
          ))}
        </Stack>
      )}

      {/* Create modal */}
      <Modal opened={createOpened} onClose={closeCreate} title="New Transaction" centered>
        <TransactionForm
          form={createForm}
          setForm={setCreateForm}
          formCurrency={createCurrency}
          accounts={accounts as FinanceAccount[]}
          categories={categories}
          onAccountChange={handleCreateAccountChange}
          onSubmit={handleCreate}
          loading={createTx.isPending}
          submitLabel="Add Transaction"
        />
      </Modal>

      {/* Edit modal */}
      <Modal opened={!!editTx} onClose={() => setEditTx(null)} title="Edit Transaction" centered>
        <TransactionForm
          form={editForm}
          setForm={setEditForm}
          formCurrency={editCurrency}
          accounts={accounts as FinanceAccount[]}
          categories={categories}
          onAccountChange={handleEditAccountChange}
          onSubmit={handleEdit}
          loading={updateTx.isPending}
          submitLabel="Save Changes"
        />
      </Modal>
    </>
  );
}

function TransactionRow({ tx, currency, categoryName, onDelete, onEdit }: { tx: FinanceTransaction; currency?: string; categoryName?: string; onDelete?: () => void; onEdit?: () => void }) {
  const isIncome = tx.type === 'income';
  return (
    <Group justify="space-between" p="sm" style={{ borderRadius: 8, background: '#f8fafc', border: '1px solid #E2E8F0' }}>
      <Group gap="sm">
        {isIncome
          ? <ArrowUpCircle size={18} style={{ color: '#2e7d32' }} />
          : <ArrowDownCircle size={18} style={{ color: '#c62828' }} />}
        <Box>
          <Text size="sm" fw={500}>{tx.description || categoryName || tx.type}</Text>
          <Text size="xs" c="dimmed">{categoryName && tx.description ? `${categoryName} · ` : ''}{tx.date}</Text>
        </Box>
      </Group>
      <Group gap="xs">
        <Text fw={600} size="sm" style={{ color: isIncome ? '#2e7d32' : '#c62828' }}>
          {isIncome ? '+' : '-'}{fmt(tx.amount, currency)}
        </Text>
        {onEdit && (
          <ActionIcon size="xs" variant="subtle" color="blue" onClick={onEdit}>
            <Pencil size={12} />
          </ActionIcon>
        )}
        {onDelete && (
          <ActionIcon size="xs" variant="subtle" color="red" onClick={onDelete}>
            <Trash2 size={12} />
          </ActionIcon>
        )}
      </Group>
    </Group>
  );
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

function AccountsView() {
  const [opened, { open, close }] = useDisclosure();
  const [catOpened, { open: openCat, close: closeCat }] = useDisclosure();
  const { data: accounts = [], isLoading } = useFinanceAccounts();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();
  const createCategory = useCreateCategory();

  const [form, setForm] = useState<Partial<CreateAccountDto>>({ type: 'checking', currency: 'USD', balance: 0 });
  const [catForm, setCatForm] = useState<Partial<CreateCategoryDto>>({ type: 'expense' });

  const handleCreate = () => {
    if (!form.name || !form.type) return;
    createAccount.mutate(form as CreateAccountDto, { onSuccess: close });
  };

  const handleCreateCategory = () => {
    if (!catForm.name || !catForm.type) return;
    createCategory.mutate(catForm as CreateCategoryDto, { onSuccess: closeCat });
  };

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text fw={600} size="sm" c="dimmed">Accounts</Text>
        <Group gap="xs">
          <Button size="xs" variant="subtle" onClick={openCat} leftSection={<Plus size={14} />}>
            Category
          </Button>
          <Button size="xs" leftSection={<Plus size={14} />} onClick={open} style={{ backgroundColor: '#0052CC' }}>
            Account
          </Button>
        </Group>
      </Group>

      {accounts.length === 0 ? (
        <Center py="xl"><Text c="dimmed" size="sm">No accounts yet. Create your first one.</Text></Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {accounts.map((acc: any) => (
            <Card key={acc.id} withBorder radius="md" p="md">
              <Group justify="space-between">
                <Box>
                  <Text fw={600}>{acc.name}</Text>
                  <Badge size="xs" variant="light" mt={4}>{acc.type}</Badge>
                </Box>
                <Group gap="xs">
                  <Text fw={700} size="lg" style={{ color: acc.balance >= 0 ? '#0052CC' : '#c62828' }}>
                    {fmt(acc.balance ?? 0, acc.currency)}
                  </Text>
                  <ActionIcon size="sm" variant="subtle" color="red" onClick={() => deleteAccount.mutate(acc.id)}>
                    <Trash2 size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Create account modal */}
      <Modal opened={opened} onClose={close} title="New Account" centered>
        <Stack gap="sm">
          <TextInput label="Name" placeholder="e.g. Main Checking" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Select
            label="Type"
            data={['checking', 'savings', 'credit', 'wallet', 'other'].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))}
            value={form.type}
            onChange={(v) => setForm((f) => ({ ...f, type: v as any }))}
          />
          <Select
            label="Currency"
            data={[
              { value: 'BRL', label: 'BRL — Real' },
              { value: 'USD', label: 'USD — Dollar' },
              { value: 'EUR', label: 'EUR — Euro' },
              { value: 'GBP', label: 'GBP — Pound' },
              { value: 'JPY', label: 'JPY — Yen' },
              { value: 'ARS', label: 'ARS — Peso' },
            ]}
            value={form.currency}
            onChange={(v) => setForm((f) => ({ ...f, currency: v ?? 'USD' }))}
          />
          <NumberInput
            label={`Initial Balance (${form.currency ?? 'USD'})`}
            value={form.balance}
            onChange={(v) => setForm((f) => ({ ...f, balance: typeof v === 'number' ? v : 0 }))}
            leftSection={<Text size="xs" c="dimmed" fw={600}>{form.currency ?? 'USD'}</Text>}
            decimalScale={2}
          />
          <Button onClick={handleCreate} loading={createAccount.isPending} disabled={!form.name} style={{ backgroundColor: '#0052CC' }}>
            Create Account
          </Button>
        </Stack>
      </Modal>

      {/* Create category modal */}
      <Modal opened={catOpened} onClose={closeCat} title="New Category" centered>
        <Stack gap="sm">
          <TextInput label="Name" placeholder="e.g. Food & Dining" value={catForm.name ?? ''} onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))} />
          <Select
            label="Type"
            data={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]}
            value={catForm.type}
            onChange={(v) => setCatForm((f) => ({ ...f, type: v as any }))}
          />
          <Button onClick={handleCreateCategory} loading={createCategory.isPending} disabled={!catForm.name} style={{ backgroundColor: '#0052CC' }}>
            Create Category
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const [view, setView] = useState<FinanceView>('overview');

  return (
    <Stack gap={0} style={{ height: '100%' }}>
      <Group mb="sm">
        <Title
          order={1}
          style={{
            fontSize: 'clamp(18px, 4vw, 28px)',
            fontWeight: 700,
            color: '#000000',
            letterSpacing: '-0.02em',
          }}
        >
          Finance
        </Title>
      </Group>

      <TabBar current={view} onChange={setView} />

      <Box style={{ overflowY: 'auto', flex: 1 }}>
        {view === 'overview' && <OverviewView />}
        {view === 'transactions' && <TransactionsView />}
        {view === 'accounts' && <AccountsView />}
        {view === 'recurring' && <RecurringView />}
        {view === 'budgets' && <BudgetsView />}
        {view === 'investments' && <InvestmentsView />}
      </Box>
    </Stack>
  );
}
