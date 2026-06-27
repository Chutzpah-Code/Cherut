'use client';

import { useState } from 'react';
import {
  Stack, Group, Text, Box, Badge, Button, Loader, Center,
  Modal, Select, NumberInput, TextInput, ActionIcon, Card, Switch,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus, Trash2, Play, RefreshCw, Pencil } from 'lucide-react';
import {
  useFinanceRecurring, useFinanceAccounts, useFinanceCategories,
  useCreateRecurring, useDeleteRecurring, useApplyRecurring, useUpdateRecurring,
} from '@/hooks/useFinance';
import { CreateRecurringDto, FinanceAccount } from '@/lib/api/services/finance';

function fmt(value: number, currency?: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency ?? 'USD' }).format(value);
  } catch {
    return `${currency ?? ''} ${value.toFixed(2)}`;
  }
}

const FREQ_LABELS: Record<string, string> = {
  daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly',
};

export function RecurringView() {
  const [opened, { open, close }] = useDisclosure();
  const { data: rules = [], isLoading } = useFinanceRecurring();
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: categories = [] } = useFinanceCategories();
  const createRecurring = useCreateRecurring();
  const deleteRecurring = useDeleteRecurring();
  const applyRecurring = useApplyRecurring();
  const updateRecurring = useUpdateRecurring();

  const accountMap = Object.fromEntries(
    (accounts as FinanceAccount[]).map((a) => [a.id, a]),
  );

  // Create form
  const [form, setForm] = useState<Partial<CreateRecurringDto>>({
    type: 'expense',
    frequency: 'monthly',
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [formCurrency, setFormCurrency] = useState('USD');
  const [createAmount, setCreateAmount] = useState<number | string>('');

  const handleAccountChange = (accountId: string | null) => {
    const acc = (accounts as FinanceAccount[]).find((a) => a.id === accountId);
    setFormCurrency(acc?.currency ?? 'USD');
    setForm((f) => ({ ...f, accountId: accountId ?? undefined }));
  };

  const handleCreate = () => {
    const amount = typeof createAmount === 'number' ? createAmount : parseFloat(createAmount as string);
    if (!form.accountId || !form.categoryId || isNaN(amount) || amount <= 0 || !form.type || !form.frequency || !form.startDate || !form.description) return;
    createRecurring.mutate(
      { ...form, amount } as CreateRecurringDto,
      {
        onSuccess: () => {
          setForm({ type: 'expense', frequency: 'monthly', startDate: new Date().toISOString().slice(0, 10) });
          setCreateAmount('');
          close();
        },
      },
    );
  };

  // Edit state
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editAmount, setEditAmount] = useState<number | string>('');
  const [editCurrency, setEditCurrency] = useState('USD');

  const openEdit = (rule: any) => {
    const acc = accountMap[rule.accountId];
    setEditTarget({ ...rule });
    setEditAmount(rule.amount);
    setEditCurrency(acc?.currency ?? 'USD');
  };

  const handleUpdate = () => {
    if (!editTarget) return;
    const amount = typeof editAmount === 'number' ? editAmount : parseFloat(editAmount as string);
    if (isNaN(amount) || amount <= 0) return;
    updateRecurring.mutate(
      {
        id: editTarget.id,
        dto: {
          description: editTarget.description,
          amount,
          type: editTarget.type,
          frequency: editTarget.frequency,
          accountId: editTarget.accountId,
          categoryId: editTarget.categoryId,
          startDate: editTarget.startDate,
        },
      },
      { onSuccess: () => setEditTarget(null) },
    );
  };

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text fw={600} size="sm" c="dimmed">Recurring Rules</Text>
        <Button size="xs" leftSection={<Plus size={14} />} onClick={open} style={{ backgroundColor: '#0052CC' }}>
          Add Rule
        </Button>
      </Group>

      {rules.length === 0 ? (
        <Center py="xl"><Text c="dimmed" size="sm">No recurring rules yet.</Text></Center>
      ) : (
        <Stack gap="sm">
          {rules.map((rule: any) => {
            const acc = accountMap[rule.accountId];
            return (
              <Card key={rule.id} withBorder radius="md" p="sm">
                <Group justify="space-between">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="xs" mb={4}>
                      <Text size="sm" fw={600} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rule.description}
                      </Text>
                      <Badge size="xs" color={rule.type === 'income' ? 'green' : 'red'} variant="light">
                        {rule.type}
                      </Badge>
                      <Badge size="xs" variant="light" color="blue">
                        {FREQ_LABELS[rule.frequency]}
                      </Badge>
                    </Group>
                    <Group gap="md">
                      <Text size="xs" c="dimmed">
                        {fmt(rule.amount, acc?.currency)} · {acc?.name ?? rule.accountId}
                      </Text>
                      {rule.nextDueDate && (
                        <Group gap={4}>
                          <RefreshCw size={11} style={{ color: '#888' }} />
                          <Text size="xs" c="dimmed">Next: {rule.nextDueDate}</Text>
                        </Group>
                      )}
                    </Group>
                  </Box>
                  <Group gap="xs">
                    <Switch
                      size="xs"
                      checked={rule.isActive}
                      onChange={(e) => updateRecurring.mutate({ id: rule.id, dto: { isActive: e.currentTarget.checked } })}
                    />
                    <ActionIcon size="sm" variant="subtle" color="blue" title="Edit" onClick={() => openEdit(rule)}>
                      <Pencil size={12} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="blue"
                      title="Apply now"
                      loading={applyRecurring.isPending}
                      onClick={() => applyRecurring.mutate(rule.id)}
                    >
                      <Play size={12} />
                    </ActionIcon>
                    <ActionIcon size="sm" variant="subtle" color="red" onClick={() => deleteRecurring.mutate(rule.id)}>
                      <Trash2 size={12} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Create modal */}
      <Modal opened={opened} onClose={close} title="New Recurring Rule" centered>
        <Stack gap="sm">
          <TextInput
            label="Description"
            placeholder="e.g. Netflix subscription"
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Select
            label="Type"
            data={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]}
            value={form.type}
            onChange={(v) => setForm((f) => ({ ...f, type: v as any }))}
          />
          <Select
            label="Frequency"
            data={['daily', 'weekly', 'monthly', 'yearly'].map((v) => ({ value: v, label: FREQ_LABELS[v] }))}
            value={form.frequency}
            onChange={(v) => setForm((f) => ({ ...f, frequency: v as any }))}
          />
          <Select
            label="Account"
            data={(accounts as FinanceAccount[]).map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
            value={form.accountId}
            onChange={handleAccountChange}
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
            min={0.01}
            decimalScale={2}
            value={createAmount}
            onChange={setCreateAmount}
            leftSection={<Text size="xs" c="dimmed" fw={600}>{formCurrency}</Text>}
          />
          <TextInput
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          />
          <Button
            onClick={handleCreate}
            loading={createRecurring.isPending}
            disabled={!form.accountId || !form.categoryId || !createAmount || !form.description}
            style={{ backgroundColor: '#0052CC' }}
          >
            Create Rule
          </Button>
        </Stack>
      </Modal>

      {/* Edit modal */}
      <Modal opened={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Recurring Rule" centered>
        {editTarget && (
          <Stack gap="sm">
            <TextInput
              label="Description"
              value={editTarget.description ?? ''}
              onChange={(e) => setEditTarget((t: any) => ({ ...t, description: e.target.value }))}
            />
            <Select
              label="Type"
              data={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]}
              value={editTarget.type}
              onChange={(v) => setEditTarget((t: any) => ({ ...t, type: v }))}
            />
            <Select
              label="Frequency"
              data={['daily', 'weekly', 'monthly', 'yearly'].map((v) => ({ value: v, label: FREQ_LABELS[v] }))}
              value={editTarget.frequency}
              onChange={(v) => setEditTarget((t: any) => ({ ...t, frequency: v }))}
            />
            <Select
              label="Account"
              data={(accounts as FinanceAccount[]).map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
              value={editTarget.accountId}
              onChange={(v) => {
                const acc = (accounts as FinanceAccount[]).find((a) => a.id === v);
                setEditCurrency(acc?.currency ?? 'USD');
                setEditTarget((t: any) => ({ ...t, accountId: v }));
              }}
            />
            <Select
              label="Category"
              data={categories.map((c: any) => ({ value: c.id, label: c.name }))}
              value={editTarget.categoryId}
              onChange={(v) => setEditTarget((t: any) => ({ ...t, categoryId: v }))}
            />
            <NumberInput
              label={`Amount (${editCurrency})`}
              min={0.01}
              decimalScale={2}
              value={editAmount}
              onChange={setEditAmount}
              leftSection={<Text size="xs" c="dimmed" fw={600}>{editCurrency}</Text>}
            />
            <Button
              onClick={handleUpdate}
              loading={updateRecurring.isPending}
              disabled={!editAmount || !editTarget.description}
              style={{ backgroundColor: '#0052CC' }}
            >
              Save Changes
            </Button>
          </Stack>
        )}
      </Modal>
    </>
  );
}
