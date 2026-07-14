'use client';

import { useState, useEffect } from 'react';
import {
  Stack, Group, Text, Box, Badge, Button, Loader, Center,
  Modal, TextInput, Select, NumberInput, ActionIcon, Collapse,
  Switch, Divider, UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  useBills, useCreateBill, useUpdateBill, useDeleteBill,
  useBillOccurrences, usePayOccurrence,
} from '@/hooks/useBills';
import { useFinanceAccounts, useFinanceCategories } from '@/hooks/useFinance';
import { FinanceBill, FinanceBillOccurrence, CreateBillDto } from '@/lib/api/services/bills';

function fmt(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function prevMonth(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nextMonth(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-').map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

const FREQ_LABELS: Record<string, string> = {
  daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'blue', paid: 'green', overdue: 'red', cancelled: 'gray',
};

// ─── Pay Modal ───────────────────────────────────────────────────────────────

function PayModal({
  occurrence, opened, onClose,
}: {
  occurrence: FinanceBillOccurrence | null;
  opened: boolean;
  onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: accounts = [] } = useFinanceAccounts();
  const payMutation = usePayOccurrence();

  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState(0);
  const [paidAt, setPaidAt] = useState(today);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (occurrence && opened) {
      setAmount(occurrence.amount);
      setPaidAt(today);
      setAccountId('');
      setNotes('');
    }
  }, [occurrence, opened, today]);

  function handlePay() {
    if (!occurrence || !accountId || amount <= 0) return;
    payMutation.mutate(
      { id: occurrence.id, dto: { accountId, amount, paidAt, notes: notes || undefined } },
      { onSuccess: onClose },
    );
  }

  const accountOptions = (accounts as any[]).map((a) => ({
    value: a.id,
    label: `${a.name} (${a.currency ?? 'USD'})`,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Pay — {occurrence?.bill?.name ?? ''}</Text>}
      size="sm"
    >
      <Stack gap="sm">
        <Select
          label="Account"
          placeholder="Select account"
          data={accountOptions}
          value={accountId}
          onChange={(v) => setAccountId(v ?? '')}
          required
        />
        <NumberInput
          label="Amount"
          min={0.01}
          decimalScale={2}
          value={amount}
          onChange={(v) => setAmount(Number(v) || 0)}
          required
        />
        <TextInput
          label="Payment date"
          type="date"
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
          required
        />
        <TextInput
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button
            color="#0052CC"
            onClick={handlePay}
            loading={payMutation.isPending}
            disabled={!accountId || amount <= 0}
          >
            Confirm Payment
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ─── Bill Form Modal ─────────────────────────────────────────────────────────

function BillFormModal({
  opened, onClose, editing,
}: {
  opened: boolean;
  onClose: () => void;
  editing: FinanceBill | null;
}) {
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: categories = [] } = useFinanceCategories();
  const createBill = useCreateBill();
  const updateBill = useUpdateBill();

  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState('expense');
  const [frequency, setFrequency] = useState('monthly');
  const [dueDay, setDueDay] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setAccountId(editing.accountId);
      setCategoryId(editing.categoryId);
      setAmount(editing.amount);
      setType(editing.type);
      setFrequency(editing.frequency);
      setDueDay(editing.dueDay);
      setStartDate(editing.startDate);
      setDescription(editing.description ?? '');
      setIsActive(editing.isActive);
    } else {
      setName(''); setAccountId(''); setCategoryId('');
      setAmount(0); setType('expense'); setFrequency('monthly');
      setDueDay(1); setStartDate(new Date().toISOString().slice(0, 10));
      setDescription(''); setIsActive(true);
    }
  }, [editing, opened]);

  function handleSubmit() {
    const dto: CreateBillDto = {
      name, accountId, categoryId,
      amount, type: type as any, frequency: frequency as any,
      dueDay, startDate, isActive,
      ...(description ? { description } : {}),
    };
    if (editing) {
      updateBill.mutate({ id: editing.id, dto }, { onSuccess: onClose });
    } else {
      createBill.mutate(dto, { onSuccess: onClose });
    }
  }

  const accountOptions = (accounts as any[]).map((a) => ({ value: a.id, label: a.name }));
  const categoryOptions = (categories as any[])
    .filter((c) => c.type === type)
    .map((c) => ({ value: c.id, label: c.name }));

  const isBusy = createBill.isPending || updateBill.isPending;
  const isValid = name && accountId && categoryId && amount > 0 && dueDay >= 1;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>{editing ? 'Edit Bill' : 'New Bill'}</Text>}
      size="md"
    >
      <Stack gap="sm">
        <TextInput
          label="Name"
          placeholder="e.g. Rent, Netflix, Salary"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Group grow>
          <Select
            label="Type"
            data={[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
            ]}
            value={type}
            onChange={(v) => { setType(v ?? 'expense'); setCategoryId(''); }}
          />
          <Select
            label="Frequency"
            data={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'daily', label: 'Daily' },
            ]}
            value={frequency}
            onChange={(v) => setFrequency(v ?? 'monthly')}
          />
        </Group>
        <Group grow>
          <Select
            label="Account"
            placeholder="Select account"
            data={accountOptions}
            value={accountId}
            onChange={(v) => setAccountId(v ?? '')}
            required
          />
          <Select
            label="Category"
            placeholder="Select category"
            data={categoryOptions}
            value={categoryId}
            onChange={(v) => setCategoryId(v ?? '')}
            required
          />
        </Group>
        <Group grow>
          <NumberInput
            label="Default Amount"
            min={0.01}
            decimalScale={2}
            value={amount}
            onChange={(v) => setAmount(Number(v) || 0)}
            required
          />
          <NumberInput
            label="Due Day (1–28)"
            description="Day of month"
            min={1}
            max={28}
            value={dueDay}
            onChange={(v) => setDueDay(Number(v) || 1)}
            required
          />
        </Group>
        <TextInput
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <TextInput
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Switch
          label="Active"
          checked={isActive}
          onChange={(e) => setIsActive(e.currentTarget.checked)}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button
            color="#0052CC"
            onClick={handleSubmit}
            loading={isBusy}
            disabled={!isValid}
          >
            {editing ? 'Save Changes' : 'Create Bill'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ─── BillsView ───────────────────────────────────────────────────────────────

export function BillsView() {
  const todayMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(todayMonth);
  const [payTarget, setPayTarget] = useState<FinanceBillOccurrence | null>(null);
  const [payOpened, { open: openPay, close: closePay }] = useDisclosure(false);
  const [billFormOpened, { open: openBillForm, close: closeBillForm }] = useDisclosure(false);
  const [editingBill, setEditingBill] = useState<FinanceBill | null>(null);
  const [manageOpen, setManageOpen] = useState(false);

  const { data: occurrences = [], isLoading } = useBillOccurrences(selectedMonth);
  const { data: bills = [] } = useBills();
  const deleteBill = useDeleteBill();

  const summary = {
    pending: (occurrences as FinanceBillOccurrence[]).filter((o) => o.status === 'pending'),
    overdue: (occurrences as FinanceBillOccurrence[]).filter((o) => o.status === 'overdue'),
    paid: (occurrences as FinanceBillOccurrence[]).filter((o) => o.status === 'paid'),
  };

  function openPayModal(occ: FinanceBillOccurrence) {
    setPayTarget(occ);
    openPay();
  }

  function openEditBill(bill: FinanceBill) {
    setEditingBill(bill);
    openBillForm();
  }

  function openNewBill() {
    setEditingBill(null);
    openBillForm();
  }

  return (
    <Stack gap="lg">
      {/* Month Navigator */}
      <Group justify="space-between" align="center">
        <Group gap={4}>
          <ActionIcon variant="subtle" onClick={() => setSelectedMonth(prevMonth(selectedMonth))}>
            <ChevronLeft size={16} />
          </ActionIcon>
          <Text fw={600} size="md" style={{ minWidth: 140, textAlign: 'center' }}>
            {formatMonthLabel(selectedMonth)}
          </Text>
          <ActionIcon variant="subtle" onClick={() => setSelectedMonth(nextMonth(selectedMonth))}>
            <ChevronRight size={16} />
          </ActionIcon>
        </Group>
        <Button size="xs" variant="light" leftSection={<Plus size={13} />} onClick={openNewBill}>
          Add Bill
        </Button>
      </Group>

      {/* Summary Cards */}
      <Group grow gap="sm">
        <Box style={{ background: '#EFF6FF', borderRadius: 10, padding: '12px 16px' }}>
          <Text size="xs" c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pending</Text>
          <Text size="lg" fw={700} c="#0052CC">{summary.pending.length}</Text>
          <Text size="xs" c="dimmed">{fmt(summary.pending.reduce((s, o) => s + o.amount, 0))}</Text>
        </Box>
        <Box style={{ background: '#FFF5F5', borderRadius: 10, padding: '12px 16px' }}>
          <Text size="xs" c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overdue</Text>
          <Text size="lg" fw={700} c="red.7">{summary.overdue.length}</Text>
          <Text size="xs" c="dimmed">{fmt(summary.overdue.reduce((s, o) => s + o.amount, 0))}</Text>
        </Box>
        <Box style={{ background: '#F0FDF4', borderRadius: 10, padding: '12px 16px' }}>
          <Text size="xs" c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Paid</Text>
          <Text size="lg" fw={700} c="green.7">{summary.paid.length}</Text>
          <Text size="xs" c="dimmed">{fmt(summary.paid.reduce((s, o) => s + o.amount, 0))}</Text>
        </Box>
      </Group>

      {/* Occurrences List */}
      {isLoading ? (
        <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>
      ) : (occurrences as FinanceBillOccurrence[]).length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="xs">
            <Text c="dimmed" size="sm">No bills for {formatMonthLabel(selectedMonth)}.</Text>
            <Text c="dimmed" size="xs">Add a bill rule below to start tracking.</Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap={6}>
          {(occurrences as FinanceBillOccurrence[]).map((occ) => (
            <Box
              key={occ.id}
              style={{
                border: `1px solid ${occ.status === 'overdue' ? '#FED7D7' : '#E2E8F0'}`,
                borderRadius: 8,
                padding: '10px 14px',
                background: occ.status === 'cancelled' ? '#F7FAFC' : '#fff',
                opacity: occ.status === 'cancelled' ? 0.6 : 1,
              }}
            >
              <Group justify="space-between">
                <Box>
                  <Text size="sm" fw={600} c={occ.status === 'cancelled' ? 'dimmed' : undefined}>
                    {occ.bill?.name ?? '—'}
                  </Text>
                  <Group gap={6} mt={2}>
                    <Badge size="xs" color={STATUS_COLOR[occ.status]} variant="light">
                      {occ.status.charAt(0).toUpperCase() + occ.status.slice(1)}
                    </Badge>
                    <Text size="xs" c="dimmed">Due {fmtDate(occ.dueDate)}</Text>
                    {occ.bill && (
                      <Badge size="xs" variant="outline" color="gray">
                        {FREQ_LABELS[occ.bill.frequency]}
                      </Badge>
                    )}
                  </Group>
                </Box>
                <Group gap="xs">
                  <Text size="sm" fw={600} c={occ.bill?.type === 'income' ? 'green.7' : 'red.7'}>
                    {occ.bill?.type === 'expense' ? '−' : '+'}{fmt(occ.amount)}
                  </Text>
                  {(occ.status === 'pending' || occ.status === 'overdue') && (
                    <Button size="xs" color="#0052CC" variant="light" onClick={() => openPayModal(occ)}>
                      Pay
                    </Button>
                  )}
                  {occ.status === 'paid' && occ.paidAt && (
                    <Text size="xs" c="green.7">Paid {fmtDate(occ.paidAt)}</Text>
                  )}
                </Group>
              </Group>
            </Box>
          ))}
        </Stack>
      )}

      <Divider />

      {/* Manage Bill Rules */}
      <Box>
        <UnstyledButton onClick={() => setManageOpen((o) => !o)} style={{ width: '100%' }}>
          <Group justify="space-between" py={4}>
            <Text fw={600} size="sm">
              Bill Rules ({(bills as FinanceBill[]).length})
            </Text>
            <Text size="xs" c="dimmed">{manageOpen ? 'Hide' : 'Show'}</Text>
          </Group>
        </UnstyledButton>

        <Collapse in={manageOpen}>
          <Stack gap={6} mt="sm">
            {(bills as FinanceBill[]).length === 0 ? (
              <Text size="sm" c="dimmed">
                No bill rules yet. Click &quot;Add Bill&quot; to create one.
              </Text>
            ) : (
              (bills as FinanceBill[]).map((bill) => (
                <Box
                  key={bill.id}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: '8px 12px',
                    background: bill.isActive ? '#fff' : '#F7FAFC',
                  }}
                >
                  <Group justify="space-between">
                    <Box>
                      <Group gap={6}>
                        <Text size="sm" fw={600} c={bill.isActive ? undefined : 'dimmed'}>
                          {bill.name}
                        </Text>
                        {!bill.isActive && (
                          <Badge size="xs" color="gray" variant="light">Inactive</Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        {FREQ_LABELS[bill.frequency]} · Day {bill.dueDay} · {fmt(bill.amount)}
                      </Text>
                    </Box>
                    <Group gap={4}>
                      <ActionIcon size="sm" variant="subtle" onClick={() => openEditBill(bill)}>
                        <Pencil size={13} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        loading={deleteBill.isPending}
                        onClick={() => deleteBill.mutate(bill.id)}
                      >
                        <Trash2 size={13} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Box>
              ))
            )}
          </Stack>
        </Collapse>
      </Box>

      <PayModal occurrence={payTarget} opened={payOpened} onClose={closePay} />
      <BillFormModal opened={billFormOpened} onClose={closeBillForm} editing={editingBill} />
    </Stack>
  );
}
