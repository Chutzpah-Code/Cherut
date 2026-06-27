'use client';

import { useState } from 'react';
import {
  Stack, Group, Text, Box, Badge, Button, Loader, Center,
  Modal, Select, NumberInput, TextInput, ActionIcon, Card, Collapse,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus, Trash2, ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import {
  useFinanceInvestments, useCreateInvestment, useDeleteInvestment, useUpdateInvestment,
  useInvestmentEntries, useCreateInvestmentEntry, useDeleteInvestmentEntry,
  useFinanceAccounts,
} from '@/hooks/useFinance';
import { CreateInvestmentDto, CreateInvestmentEntryDto, FinanceAccount, FinanceInvestment, InvestmentType } from '@/lib/api/services/finance';

function fmt(value: number, currency?: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency ?? 'USD' }).format(value);
  } catch {
    return `${currency ?? ''} ${value.toFixed(2)}`;
  }
}

const TYPE_LABELS: Record<string, string> = {
  stock: 'Stock', crypto: 'Crypto', fund: 'Fund', real_estate: 'Real Estate', other: 'Other',
};


function InvestmentCard({ inv, accounts, onDelete }: { inv: FinanceInvestment; accounts: FinanceAccount[]; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [entryModal, { open: openEntry, close: closeEntry }] = useDisclosure();
  const [editModal, { open: openEdit, close: closeEdit }] = useDisclosure();
  const { data: entries = [], isLoading: entriesLoading } = useInvestmentEntries(expanded ? inv.id : '');
  const createEntry = useCreateInvestmentEntry();
  const deleteEntry = useDeleteInvestmentEntry();
  const updateInvestment = useUpdateInvestment();

  // Contribution form
  const [entryAmount, setEntryAmount] = useState<number | string>('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [entryNotes, setEntryNotes] = useState('');

  const parsedAmount = typeof entryAmount === 'number' ? entryAmount : parseFloat(entryAmount as string);
  const amountValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const [entryError, setEntryError] = useState('');

  const handleCreateEntry = () => {
    if (!amountValid || !entryDate) return;
    setEntryError('');
    createEntry.mutate(
      { investmentId: inv.id, amount: parsedAmount, date: entryDate, notes: entryNotes || undefined },
      {
        onSuccess: () => {
          setEntryAmount('');
          setEntryDate(new Date().toISOString().slice(0, 10));
          setEntryNotes('');
          setEntryError('');
          closeEntry();
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message;
          setEntryError(Array.isArray(msg) ? msg.join(', ') : (msg ?? err?.message ?? 'Failed to save contribution'));
        },
      },
    );
  };

  // Edit form
  const [editForm, setEditForm] = useState({
    name: inv.name,
    type: inv.type,
    ticker: inv.ticker ?? '',
    currency: inv.currency ?? 'USD',
    notes: inv.notes ?? '',
    accountId: inv.accountId ?? '',
  });

  const handleOpenEdit = () => {
    setEditForm({
      name: inv.name,
      type: inv.type,
      ticker: inv.ticker ?? '',
      currency: inv.currency ?? 'USD',
      notes: inv.notes ?? '',
      accountId: inv.accountId ?? '',
    });
    openEdit();
  };

  const handleEditAccountChange = (accountId: string | null) => {
    const acct = accounts.find((a) => a.id === accountId);
    setEditForm((f) => ({ ...f, accountId: accountId ?? '', currency: acct?.currency ?? f.currency }));
  };

  const handleUpdate = () => {
    if (!editForm.name) return;
    updateInvestment.mutate(
      {
        id: inv.id,
        dto: {
          name: editForm.name,
          type: editForm.type as any,
          ticker: editForm.ticker || undefined,
          currency: editForm.currency,
          notes: editForm.notes || undefined,
          accountId: editForm.accountId || undefined,
        },
      },
      { onSuccess: closeEdit },
    );
  };

  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={expanded ? 'sm' : 0}>
        <Box style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded((v) => !v)}>
          <Group gap="xs" wrap="wrap">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Text size="sm" fw={600}>{inv.name}</Text>
            <Badge size="xs" variant="light">{TYPE_LABELS[inv.type] ?? inv.type}</Badge>
            {inv.ticker && <Badge size="xs" variant="outline" color="gray">{inv.ticker}</Badge>}
            {inv.accountId && (() => {
              const acct = accounts.find((a) => a.id === inv.accountId);
              return acct ? <Badge size="xs" variant="light" color="blue">{acct.name}</Badge> : null;
            })()}
          </Group>
          <Text size="xs" c="dimmed" ml={22} mt={2}>
            Total contributed: {fmt(inv.totalContributed, inv.currency)}
          </Text>
        </Box>
        <Group gap={4}>
          <ActionIcon size="sm" variant="subtle" color="blue" onClick={handleOpenEdit}>
            <Pencil size={13} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="red" onClick={onDelete}>
            <Trash2 size={14} />
          </ActionIcon>
        </Group>
      </Group>

      <Collapse in={expanded}>
        <Box mt="sm" style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12 }}>
          <Group justify="space-between" mb="xs">
            <Text size="xs" fw={600} c="dimmed">Contributions</Text>
            <Button size="xs" variant="subtle" leftSection={<Plus size={12} />} onClick={() => {
              setEntryAmount('');
              setEntryDate(new Date().toISOString().slice(0, 10));
              setEntryNotes('');
              setEntryError('');
              openEntry();
            }}>
              Add
            </Button>
          </Group>

          {entriesLoading ? (
            <Center py="sm"><Loader size="xs" /></Center>
          ) : entries.length === 0 ? (
            <Text size="xs" c="dimmed">No contributions yet.</Text>
          ) : (
            <Stack gap={4}>
              {entries.map((entry: any) => (
                <Group key={entry.id} justify="space-between" px="xs" py={4}
                  style={{ borderRadius: 6, background: '#f8fafc' }}>
                  <Text size="xs" c="dimmed">{entry.date}</Text>
                  <Group gap="xs">
                    <Text size="xs" fw={600}>{fmt(entry.amount, inv.currency)}</Text>
                    <ActionIcon
                      size="xs" variant="subtle" color="red"
                      onClick={() => deleteEntry.mutate({ id: entry.id, investmentId: inv.id })}
                    >
                      <Trash2 size={10} />
                    </ActionIcon>
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>

      {/* Add contribution modal */}
      <Modal opened={entryModal} onClose={closeEntry} title="Add Contribution" centered>
        <Stack gap="sm">
          <NumberInput
            label={`Amount (${inv.currency})`}
            min={0.01}
            decimalScale={2}
            value={entryAmount}
            onChange={setEntryAmount}
            leftSection={<Text size="xs" c="dimmed" fw={600}>{inv.currency}</Text>}
          />
          <TextInput
            label="Date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
          <TextInput
            label="Notes"
            placeholder="Optional"
            value={entryNotes}
            onChange={(e) => setEntryNotes(e.target.value)}
          />
          {entryError && (
            <Text size="xs" c="red" style={{ background: '#FEF2F2', padding: '8px 10px', borderRadius: 6 }}>
              {entryError}
            </Text>
          )}
          <Button
            onClick={handleCreateEntry}
            loading={createEntry.isPending}
            disabled={!amountValid}
            style={{ backgroundColor: '#0052CC' }}
          >
            Add Contribution
          </Button>
        </Stack>
      </Modal>

      {/* Edit investment modal */}
      <Modal opened={editModal} onClose={closeEdit} title="Edit Investment" centered>
        <Stack gap="sm">
          <Select
            label="Account"
            description="The account this investment is funded from"
            placeholder="Select account"
            data={accounts.map((a) => ({
              value: a.id,
              label: `${a.name} — ${fmt(a.balance, a.currency)}`,
            }))}
            value={editForm.accountId || null}
            onChange={handleEditAccountChange}
          />
          {editForm.currency && (
            <Group gap={6}>
              <Text size="xs" c="dimmed">Currency:</Text>
              <Badge size="sm" variant="light" color="blue">{editForm.currency}</Badge>
              <Text size="xs" c="dimmed">(from account)</Text>
            </Group>
          )}
          <TextInput
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Select
            label="Type"
            data={Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            value={editForm.type}
            onChange={(v) => setEditForm((f) => ({ ...f, type: (v ?? f.type) as InvestmentType }))}
          />
          <TextInput
            label="Ticker (optional)"
            placeholder="e.g. AAPL"
            value={editForm.ticker}
            onChange={(e) => setEditForm((f) => ({ ...f, ticker: e.target.value }))}
          />
          <TextInput
            label="Notes (optional)"
            value={editForm.notes}
            onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <Button
            onClick={handleUpdate}
            loading={updateInvestment.isPending}
            disabled={!editForm.name}
            style={{ backgroundColor: '#0052CC' }}
          >
            Save Changes
          </Button>
        </Stack>
      </Modal>
    </Card>
  );
}

export function InvestmentsView() {
  const [opened, { open, close }] = useDisclosure();
  const { data: investments = [], isLoading } = useFinanceInvestments();
  const { data: accounts = [] } = useFinanceAccounts();
  const createInvestment = useCreateInvestment();
  const deleteInvestment = useDeleteInvestment();

  const [form, setForm] = useState<Partial<CreateInvestmentDto>>({ type: 'stock' });

  const handleAccountChange = (accountId: string | null) => {
    const acct = accounts.find((a) => a.id === accountId);
    setForm((f) => ({ ...f, accountId: accountId ?? undefined, currency: acct?.currency ?? undefined }));
  };

  const handleCreate = () => {
    if (!form.name || !form.type || !form.accountId) return;
    createInvestment.mutate(form as CreateInvestmentDto, {
      onSuccess: () => {
        setForm({ type: 'stock' });
        close();
      },
    });
  };

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text fw={600} size="sm" c="dimmed">Investments</Text>
        <Button size="xs" leftSection={<Plus size={14} />} onClick={open} style={{ backgroundColor: '#0052CC' }}>
          Add Investment
        </Button>
      </Group>

      {investments.length === 0 ? (
        <Center py="xl"><Text c="dimmed" size="sm">No investments yet.</Text></Center>
      ) : (
        <Stack gap="sm">
          {(investments as FinanceInvestment[]).map((inv) => (
            <InvestmentCard
              key={inv.id}
              inv={inv}
              accounts={accounts}
              onDelete={() => deleteInvestment.mutate(inv.id)}
            />
          ))}
        </Stack>
      )}

      <Modal opened={opened} onClose={close} title="New Investment" centered>
        <Stack gap="sm">
          <Select
            label="Account"
            description="The account this investment is funded from"
            placeholder="Select account"
            required
            data={accounts.map((a) => ({
              value: a.id,
              label: `${a.name} — ${fmt(a.balance, a.currency)}`,
            }))}
            value={form.accountId ?? null}
            onChange={handleAccountChange}
          />
          {form.currency && (
            <Group gap={6}>
              <Text size="xs" c="dimmed">Currency:</Text>
              <Badge size="sm" variant="light" color="blue">{form.currency}</Badge>
              <Text size="xs" c="dimmed">(from account)</Text>
            </Group>
          )}
          <TextInput
            label="Name"
            placeholder="e.g. Apple Stock"
            value={form.name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Select
            label="Type"
            data={Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            value={form.type}
            onChange={(v) => setForm((f) => ({ ...f, type: v as any }))}
          />
          <TextInput
            label="Ticker (optional)"
            placeholder="e.g. AAPL"
            value={form.ticker ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value || undefined }))}
          />
          <TextInput
            label="Notes (optional)"
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || undefined }))}
          />
          <Button
            onClick={handleCreate}
            loading={createInvestment.isPending}
            disabled={!form.name || !form.accountId}
            style={{ backgroundColor: '#0052CC' }}
          >
            Create Investment
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
