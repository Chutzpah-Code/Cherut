'use client';

import { useState, useMemo } from 'react';
import {
  Stack, Group, Title, Text, Box, SimpleGrid, Card, Badge, Grid,
  Button, Loader, Center, UnstyledButton, Modal,
  TextInput, Select, NumberInput, ActionIcon,
} from '@mantine/core';
import { PieChart, Pie, Cell } from 'recharts';
import { useDisclosure } from '@mantine/hooks';
import {
  TrendingUp, Wallet, Plus, Trash2, Pencil, Check, X,
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
  useUpdateCategory,
  useDeleteCategory,
  useFinanceInvestments,
} from '@/hooks/useFinance';
import { CreateAccountDto, CreateTransactionDto, CreateCategoryDto, FinanceTransaction, FinanceAccount } from '@/lib/api/services/finance';
import { RecurringView } from './components/RecurringView';
import { BudgetsView } from './components/BudgetsView';
import { InvestmentsView } from './components/InvestmentsView';
import { CardsView } from './components/CardsView';
import { UpcomingView } from './components/UpcomingView';

type FinanceView = 'overview' | 'transactions' | 'accounts' | 'recurring' | 'budgets' | 'investments' | 'cards' | 'upcoming';

const TABS: { id: FinanceView; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'cards', label: 'Cards' },
  { id: 'recurring', label: 'Recurring' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'investments', label: 'Investments' },
  { id: 'upcoming', label: 'Upcoming' },
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

const CARD_LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#64748B',
};


function IconBox({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <Box style={{
      width: 34, height: 34, borderRadius: 8, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {children}
    </Box>
  );
}


function HeroBalanceCard({
  totalConverted, displayCurrency, balanceByCurrency, availableCurrencies, onCurrencyChange,
}: {
  totalConverted: number;
  displayCurrency: string;
  balanceByCurrency: Record<string, number>;
  availableCurrencies: string[];
  onCurrencyChange: (c: string) => void;
}) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const breakdown = Object.entries(balanceByCurrency);

  return (
    <Box style={{
      background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%)',
      border: '1px solid #DBEAFE', borderLeft: '3px solid #0052CC',
      borderRadius: 12, padding: '24px 28px', height: '100%', minHeight: 160,
    }}>
      <Group justify="space-between" mb={8}>
        <Group gap={10}>
          <IconBox bg="#DBEAFE"><Wallet size={16} color="#0052CC" /></IconBox>
          <Box>
            <Text style={CARD_LABEL}>Consolidated Total</Text>
            <Text style={{ fontSize: 10, color: '#94A3B8' }}>All accounts converted to</Text>
          </Box>
        </Group>
        <Select
          data={availableCurrencies}
          value={displayCurrency}
          onChange={(v) => v && onCurrencyChange(v)}
          size="xs"
          w={80}
          comboboxProps={{ withinPortal: true }}
          styles={{ input: { fontSize: 12, fontWeight: 600, color: '#0052CC', border: '1px solid #DBEAFE', background: '#EFF6FF' } }}
        />
      </Group>

      <Text style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', color: '#0F172A', lineHeight: 1, marginBottom: 16 }}>
        {fmt(totalConverted, displayCurrency)}
      </Text>

      {breakdown.length > 0 && (
        <Box style={{ borderTop: '1px solid #DBEAFE', paddingTop: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 8 }}>
            Original balance per currency
          </Text>
          <Stack gap={4}>
            {breakdown.map(([cur, val]) => {
              const isNeg = val < 0;
              return (
                <Group key={cur} justify="space-between">
                  <Text style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{cur}</Text>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: isNeg ? '#c62828' : '#334155' }}>
                    {fmt(val, cur)}
                  </Text>
                </Group>
              );
            })}
          </Stack>
        </Box>
      )}

      <Text style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '0.02em', marginTop: 12 }}>
        as of {today}
      </Text>
    </Box>
  );
}

type DonutPeriod = 'today' | 'week' | 'month' | 'recent';

const PERIOD_LABELS: Record<DonutPeriod, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  recent: 'Recent',
};

function getPeriodDates(period: DonutPeriod): { startDate?: string; endDate?: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  if (period === 'today') return { startDate: today, endDate: today };
  if (period === 'week') {
    const mon = new Date(now);
    mon.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
    return { startDate: mon.toISOString().slice(0, 10), endDate: today };
  }
  return {};
}

function DonutCard({ displayCurrency }: { displayCurrency: string }) {
  const [period, setPeriod] = useState<DonutPeriod>('month');
  const isRecent = period === 'recent';

  const { startDate, endDate } = getPeriodDates(period);
  const { data, isFetching: overviewFetching } = useFinanceOverview(
    undefined, displayCurrency, startDate, endDate,
  );
  const { data: allTx = [], isFetching: txFetching } = useFinanceTransactions();

  const isFetching = isRecent ? txFetching : overviewFetching;

  const totalIncome = isRecent
    ? (allTx as FinanceTransaction[]).filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    : (data?.totalIncomeConverted ?? 0);
  const totalExpenses = isRecent
    ? (allTx as FinanceTransaction[]).filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    : (data?.totalExpensesConverted ?? 0);
  const net = totalIncome - totalExpenses;
  const hasData = totalIncome > 0 || totalExpenses > 0;

  const slices = hasData
    ? ([
        totalIncome > 0 ? { name: 'Income', value: totalIncome } : null,
        totalExpenses > 0 ? { name: 'Expenses', value: totalExpenses } : null,
      ].filter(Boolean) as { name: string; value: number }[])
    : [{ name: 'Empty', value: 1 }];

  const SLICE_COLORS = hasData ? ['#2e7d32', '#c62828'] : ['#E2E8F0'];

  return (
    <Box style={{
      border: '1px solid #E2E8F0', borderRadius: 12,
      padding: '24px 28px', background: '#fff', height: '100%',
    }}>
      <Group justify="space-between" mb={16}>
        <Text style={CARD_LABEL}>{PERIOD_LABELS[period]} · {displayCurrency}</Text>
        <Group gap={2}>
          {(['today', 'week', 'month', 'recent'] as DonutPeriod[]).map((p) => (
            <UnstyledButton
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                color: period === p ? '#0052CC' : '#94A3B8',
                background: period === p ? '#EFF6FF' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {PERIOD_LABELS[p]}
            </UnstyledButton>
          ))}
        </Group>
      </Group>

      <Box style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 16, opacity: isFetching ? 0.5 : 1, transition: 'opacity 0.2s' }}>
        <PieChart width={156} height={156}>
          <Pie data={slices} cx={74} cy={74} innerRadius={50} outerRadius={74}
            dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}>
            {slices.map((_, i) => <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />)}
          </Pie>
        </PieChart>
        <Box style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none',
        }}>
          <Text style={{ fontSize: 10, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>net</Text>
          <Text style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, color: !hasData ? '#94A3B8' : net >= 0 ? '#2e7d32' : '#c62828' }}>
            {hasData ? `${net >= 0 ? '+' : ''}${fmt(net, displayCurrency)}` : '—'}
          </Text>
        </Box>
      </Box>

      {hasData ? (
        <Stack gap={8}>
          {[
            { label: 'Income', value: totalIncome, color: '#2e7d32', sign: '+' },
            { label: 'Expenses', value: totalExpenses, color: '#c62828', sign: '-' },
          ].filter(r => r.value > 0).map(row => (
            <Group key={row.label} justify="space-between">
              <Group gap={6}>
                <Box style={{ width: 8, height: 8, borderRadius: 2, background: row.color, flexShrink: 0 }} />
                <Text style={{ fontSize: 12, color: '#64748B' }}>{row.label}</Text>
              </Group>
              <Text style={{ fontSize: 13, fontWeight: 600, color: row.color }}>
                {row.sign}{fmt(row.value, displayCurrency)}
              </Text>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>No transactions</Text>
      )}
    </Box>
  );
}

function RecentTxList({ transactions, accountMap, categoryMap, onViewAll }: {
  transactions: (FinanceTransaction & { accountName: string })[];
  accountMap: Record<string, FinanceAccount>;
  categoryMap: Record<string, any>;
  onViewAll: () => void;
}) {
  return (
    <Box style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      <Group justify="space-between" style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9' }}>
        <Text style={CARD_LABEL}>Recent Transactions</Text>
        <UnstyledButton onClick={onViewAll} style={{ fontSize: 12, color: '#0052CC', fontWeight: 500 }}>
          View all →
        </UnstyledButton>
      </Group>

      {transactions.length === 0 ? (
        <Center py="xl"><Text style={{ fontSize: 13, color: '#94A3B8' }}>No transactions this month</Text></Center>
      ) : (
        transactions.map((tx, i) => {
          const isIncome = tx.type === 'income';
          const currency = accountMap[tx.accountId]?.currency;
          const categoryName = categoryMap[tx.categoryId]?.name;
          return (
            <Group key={tx.id} justify="space-between" style={{
              padding: '11px 20px',
              borderBottom: i < transactions.length - 1 ? '1px solid #F8FAFC' : 'none',
            }}>
              <Group gap="sm">
                <Box style={{
                  width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                  background: isIncome ? '#F0FDF4' : '#FEF2F2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isIncome
                    ? <ArrowUpCircle size={15} color="#2e7d32" />
                    : <ArrowDownCircle size={15} color="#c62828" />}
                </Box>
                <Box>
                  <Text style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', lineHeight: 1.3 }}>
                    {tx.description || categoryName || tx.type}
                  </Text>
                  <Group gap={4}>
                    {tx.accountName && (
                      <Badge size="xs" variant="light" color="blue" style={{ fontWeight: 500, textTransform: 'none' }}>
                        {tx.accountName}
                      </Badge>
                    )}
                    <Text style={{ fontSize: 11, color: '#94A3B8' }}>
                      {categoryName ? `${categoryName} · ` : ''}{tx.date}
                    </Text>
                  </Group>
                </Box>
              </Group>
              <Text style={{ fontSize: 13, fontWeight: 700, flexShrink: 0, color: isIncome ? '#2e7d32' : '#c62828' }}>
                {isIncome ? '+' : '-'}{fmt(tx.amount, currency)}
              </Text>
            </Group>
          );
        })
      )}
    </Box>
  );
}

function InvestmentsPanel({ onViewAll }: { onViewAll: () => void }) {
  const { data: investments = [] } = useFinanceInvestments();
  const sorted = [...(investments as any[])].sort((a, b) => b.totalContributed - a.totalContributed).slice(0, 5);

  const totalByCurrency: Record<string, number> = {};
  for (const inv of investments as any[]) {
    const cur = inv.currency ?? 'USD';
    totalByCurrency[cur] = (totalByCurrency[cur] ?? 0) + (inv.totalContributed ?? 0);
  }
  const totalEntries = Object.entries(totalByCurrency);

  return (
    <Box style={{
      border: '1px solid #E2E8F0', borderLeft: '3px solid #0052CC',
      borderRadius: 12, overflow: 'hidden', background: '#fff',
    }}>
      <Group justify="space-between" style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9' }}>
        <Group gap={8}>
          <IconBox bg="#EFF6FF"><TrendingUp size={14} color="#0052CC" /></IconBox>
          <Text style={CARD_LABEL}>Portfolio</Text>
        </Group>
        <UnstyledButton onClick={onViewAll} style={{ fontSize: 12, color: '#0052CC', fontWeight: 500 }}>
          View all →
        </UnstyledButton>
      </Group>

      <Box style={{ padding: '16px 20px' }}>
        <Text style={{ fontSize: 10, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
          Total Contributed
        </Text>
        {totalEntries.length === 0
          ? <Text style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#94A3B8', marginBottom: 16 }}>—</Text>
          : totalEntries.map(([cur, val]) => (
            <Text key={cur} style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#0052CC', marginBottom: 4 }}>
              {fmt(val, cur)}
            </Text>
          ))}

        {sorted.length === 0 ? (
          <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 12 }}>No investments yet</Text>
        ) : (
          <Stack gap={10} mt={16}>
            {sorted.map((inv) => (
              <Group key={inv.id} justify="space-between">
                <Group gap={8}>
                  <Box style={{ width: 6, height: 6, borderRadius: '50%', background: '#0052CC', flexShrink: 0, marginTop: 1 }} />
                  <Box>
                    <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155', lineHeight: 1.2 }}>{inv.name}</Text>
                    {inv.ticker && <Text style={{ fontSize: 10, color: '#94A3B8', letterSpacing: '0.04em' }}>{inv.ticker}</Text>}
                  </Box>
                </Group>
                <Text style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', flexShrink: 0 }}>
                  {fmt(inv.totalContributed ?? 0, inv.currency)}
                </Text>
              </Group>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

function OverviewView({ onNavigate }: { onNavigate: (v: FinanceView) => void }) {
  const [displayCurrency, setDisplayCurrency] = useState<string>(() => {
    try { return localStorage.getItem('finance_display_currency') ?? 'USD'; } catch { return 'USD'; }
  });

  const handleCurrencyChange = (cur: string) => {
    setDisplayCurrency(cur);
    try { localStorage.setItem('finance_display_currency', cur); } catch {}
  };

  const { data, isLoading } = useFinanceOverview(undefined, displayCurrency);
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: categories = [] } = useFinanceCategories();
  const { data: allTransactions = [] } = useFinanceTransactions();

  const accountMap = useMemo(
    () => Object.fromEntries((accounts as FinanceAccount[]).map((a) => [a.id, a])),
    [accounts],
  );
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c: any) => [c.id, c])),
    [categories],
  );

  const recentTransactions = useMemo(
    () => [...(allTransactions as FinanceTransaction[])]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5)
      .map((t) => ({ ...t, accountName: (accountMap[t.accountId] as FinanceAccount)?.name ?? '' })),
    [allTransactions, accountMap],
  );

  const availableCurrencies = data ? Object.keys(data.balanceByCurrency) : [];

  // If saved currency is no longer in accounts, fall back to first available
  if (data && availableCurrencies.length > 0 && !availableCurrencies.includes(displayCurrency)) {
    handleCurrencyChange(availableCurrencies[0]);
  }

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;
  if (!data) return null;

  return (
    <Stack gap="md" style={{ overflow: 'hidden' }}>
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 7 }}>
          <HeroBalanceCard
            totalConverted={data.totalBalanceConverted}
            displayCurrency={displayCurrency}
            balanceByCurrency={data.balanceByCurrency}
            availableCurrencies={availableCurrencies}
            onCurrencyChange={handleCurrencyChange}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 5 }}>
          <DonutCard displayCurrency={displayCurrency} />
        </Grid.Col>
      </Grid>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 7 }}>
          <RecentTxList
            transactions={recentTransactions}
            accountMap={accountMap}
            categoryMap={categoryMap}
            onViewAll={() => onNavigate('transactions')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 5 }}>
          <InvestmentsPanel onViewAll={() => onNavigate('investments')} />
        </Grid.Col>
      </Grid>
    </Stack>
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
  const { data: categories = [] } = useFinanceCategories();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [form, setForm] = useState<Partial<CreateAccountDto>>({ type: 'checking', currency: 'USD', balance: 0 });
  const [catForm, setCatForm] = useState<Partial<CreateCategoryDto>>({ type: 'expense' });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  const handleCreate = () => {
    if (!form.name || !form.type) return;
    createAccount.mutate(form as CreateAccountDto, { onSuccess: close });
  };

  const handleCreateCategory = () => {
    if (!catForm.name || !catForm.type) return;
    createCategory.mutate(catForm as CreateCategoryDto, { onSuccess: () => { closeCat(); setCatForm({ type: 'expense' }); } });
  };

  const startEditCat = (cat: any) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const saveEditCat = (id: string) => {
    if (!editingCatName.trim()) return;
    updateCategory.mutate({ id, dto: { name: editingCatName.trim() } }, { onSuccess: () => setEditingCatId(null) });
  };

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  return (
    <>
      {/* ── Accounts ── */}
      <Group justify="space-between" mb="md">
        <Text fw={600} size="sm" c="dimmed">Accounts</Text>
        <Button size="xs" leftSection={<Plus size={14} />} onClick={open} style={{ backgroundColor: '#0052CC' }}>
          Add Account
        </Button>
      </Group>

      {accounts.length === 0 ? (
        <Center py="xl"><Text c="dimmed" size="sm">No accounts yet. Create your first one.</Text></Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
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

      {/* ── Categories ── */}
      <Group justify="space-between" mb="sm">
        <Text fw={600} size="sm" c="dimmed">Categories</Text>
        <Button size="xs" leftSection={<Plus size={14} />} onClick={openCat} variant="subtle">
          Add Category
        </Button>
      </Group>

      {categories.length === 0 ? (
        <Center py="xl"><Text c="dimmed" size="sm">No categories yet.</Text></Center>
      ) : (
        <Stack gap="xs">
          {(categories as any[]).map((cat) => (
            <Group key={cat.id} justify="space-between" p="sm" style={{ borderRadius: 8, background: '#f8fafc', border: '1px solid #E2E8F0' }}>
              {editingCatId === cat.id ? (
                <TextInput
                  value={editingCatName}
                  onChange={(e) => setEditingCatName(e.target.value)}
                  size="xs"
                  style={{ flex: 1 }}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveEditCat(cat.id); if (e.key === 'Escape') setEditingCatId(null); }}
                  autoFocus
                />
              ) : (
                <Group gap="sm" style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>{cat.name}</Text>
                  <Badge size="xs" variant="light" color={cat.type === 'income' ? 'green' : 'red'}>
                    {cat.type}
                  </Badge>
                </Group>
              )}
              <Group gap={4}>
                {editingCatId === cat.id ? (
                  <>
                    <ActionIcon size="sm" color="green" onClick={() => saveEditCat(cat.id)} loading={updateCategory.isPending}>
                      <Check size={12} />
                    </ActionIcon>
                    <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => setEditingCatId(null)}>
                      <X size={12} />
                    </ActionIcon>
                  </>
                ) : (
                  <>
                    <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => startEditCat(cat)}>
                      <Pencil size={12} />
                    </ActionIcon>
                    <ActionIcon size="sm" variant="subtle" color="red" onClick={() => deleteCategory.mutate(cat.id)}>
                      <Trash2 size={12} />
                    </ActionIcon>
                  </>
                )}
              </Group>
            </Group>
          ))}
        </Stack>
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
          {form.type === 'credit' && (
            <>
              <NumberInput
                label={`Credit Limit (${form.currency ?? 'USD'})`}
                description="Maximum spending limit"
                min={0}
                decimalScale={2}
                value={form.creditLimit ?? ''}
                onChange={(v) => setForm((f) => ({ ...f, creditLimit: typeof v === 'number' ? v : undefined }))}
                leftSection={<Text size="xs" c="dimmed" fw={600}>{form.currency ?? 'USD'}</Text>}
              />
              <NumberInput
                label="Statement Closing Day"
                description="Day of month when billing cycle closes (1–28)"
                min={1}
                max={28}
                value={form.statementClosingDay ?? ''}
                onChange={(v) => setForm((f) => ({ ...f, statementClosingDay: typeof v === 'number' ? v : undefined }))}
              />
              <NumberInput
                label="Payment Due Day"
                description="Day of month when payment is due (1–28)"
                min={1}
                max={28}
                value={form.statementDueDay ?? ''}
                onChange={(v) => setForm((f) => ({ ...f, statementDueDay: typeof v === 'number' ? v : undefined }))}
              />
            </>
          )}
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
    <Stack gap={0}>
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

      <Box style={{ overflowX: 'hidden', paddingBottom: 24 }}>
        {view === 'overview' && <OverviewView onNavigate={setView} />}
        {view === 'transactions' && <TransactionsView />}
        {view === 'accounts' && <AccountsView />}
        {view === 'recurring' && <RecurringView />}
        {view === 'budgets' && <BudgetsView />}
        {view === 'investments' && <InvestmentsView />}
        {view === 'cards' && <CardsView />}
        {view === 'upcoming' && <UpcomingView />}
      </Box>
    </Stack>
  );
}
