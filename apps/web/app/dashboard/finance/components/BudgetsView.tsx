'use client';

import { useState } from 'react';
import {
  Stack, Group, Text, Box, Button, Loader, Center,
  Modal, Select, NumberInput, ActionIcon, Card, Progress,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus, Trash2, Pencil } from 'lucide-react';
import {
  useFinanceBudgets, useFinanceCategories,
  useCreateBudget, useDeleteBudget, useUpdateBudget,
} from '@/hooks/useFinance';
import { CreateBudgetDto } from '@/lib/api/services/finance';

function fmt(value: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthOptions() {
  const fmtDate = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const options = [];
  const now = new Date();
  for (let i = -12; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    options.push({ value, label: fmtDate.format(d) });
  }
  return options;
}

const MONTH_OPTIONS = monthOptions();

export function BudgetsView() {
  const [opened, { open, close }] = useDisclosure();
  const [month, setMonth] = useState(currentMonth());
  const { data: budgets = [], isLoading } = useFinanceBudgets(month);
  const { data: categories = [] } = useFinanceCategories('expense');
  const createBudget = useCreateBudget();
  const deleteBudget = useDeleteBudget();
  const updateBudget = useUpdateBudget();

  const categoryMap = Object.fromEntries(categories.map((c: any) => [c.id, c]));

  // Create form
  const [form, setForm] = useState<Partial<CreateBudgetDto>>({ month: currentMonth() });
  const [createAmount, setCreateAmount] = useState<number | string>('');

  const handleCreate = () => {
    const amount = typeof createAmount === 'number' ? createAmount : parseFloat(createAmount as string);
    if (!form.categoryId || isNaN(amount) || amount <= 0 || !form.month) return;
    createBudget.mutate(
      { ...form, amount } as CreateBudgetDto,
      {
        onSuccess: () => {
          setForm({ month: currentMonth() });
          setCreateAmount('');
          close();
        },
      },
    );
  };

  // Edit state
  const [editTarget, setEditTarget] = useState<{ id: string; amount: number } | null>(null);
  const [editAmount, setEditAmount] = useState<number | string>('');

  const openEdit = (budget: any) => {
    setEditTarget({ id: budget.id, amount: budget.amount });
    setEditAmount(budget.amount);
  };

  const handleUpdate = () => {
    if (!editTarget) return;
    const amount = typeof editAmount === 'number' ? editAmount : parseFloat(editAmount as string);
    if (isNaN(amount) || amount <= 0) return;
    updateBudget.mutate(
      { id: editTarget.id, dto: { amount } },
      { onSuccess: () => setEditTarget(null) },
    );
  };

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Text fw={600} size="sm" c="dimmed">Budgets</Text>
          <Select
            data={MONTH_OPTIONS}
            value={month}
            onChange={(v) => v && setMonth(v)}
            size="xs"
            w={160}
            comboboxProps={{ withinPortal: true }}
          />
        </Group>
        <Button size="xs" leftSection={<Plus size={14} />} onClick={open} style={{ backgroundColor: '#0052CC' }}>
          Add Budget
        </Button>
      </Group>

      {budgets.length === 0 ? (
        <Center py="xl"><Text c="dimmed" size="sm">No budgets for this month.</Text></Center>
      ) : (
        <Stack gap="sm">
          {budgets.map((budget: any) => {
            const cat = categoryMap[budget.categoryId];
            const spent = budget.spent ?? 0;
            const pct = budget.amount > 0 ? Math.min(100, (spent / budget.amount) * 100) : 0;
            const over = spent > budget.amount;
            return (
              <Card key={budget.id} withBorder radius="md" p="md">
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={600}>{cat?.name ?? budget.categoryId}</Text>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">{fmt(spent)} / {fmt(budget.amount)}</Text>
                    <ActionIcon size="xs" variant="subtle" color="blue" onClick={() => openEdit(budget)}>
                      <Pencil size={11} />
                    </ActionIcon>
                    <ActionIcon size="xs" variant="subtle" color="red" onClick={() => deleteBudget.mutate(budget.id)}>
                      <Trash2 size={11} />
                    </ActionIcon>
                  </Group>
                </Group>
                <Progress
                  value={pct}
                  color={over ? 'red' : pct > 75 ? 'orange' : 'blue'}
                  size="sm"
                  radius="xl"
                />
                {over && (
                  <Text size="xs" c="red" mt={4}>
                    Over budget by {fmt(spent - budget.amount)}
                  </Text>
                )}
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Create modal */}
      <Modal opened={opened} onClose={close} title="New Budget" centered>
        <Stack gap="sm">
          <Select
            label="Category"
            data={categories.map((c: any) => ({ value: c.id, label: c.name }))}
            value={form.categoryId}
            onChange={(v) => setForm((f) => ({ ...f, categoryId: v ?? undefined }))}
            placeholder="Select expense category"
          />
          <NumberInput
            label="Budget Amount"
            min={0.01}
            decimalScale={2}
            value={createAmount}
            onChange={setCreateAmount}
          />
          <Select
            label="Month"
            data={MONTH_OPTIONS}
            value={form.month ?? currentMonth()}
            onChange={(v) => setForm((f) => ({ ...f, month: v ?? currentMonth() }))}
            comboboxProps={{ withinPortal: true }}
          />
          <Button
            onClick={handleCreate}
            loading={createBudget.isPending}
            disabled={!form.categoryId || !createAmount}
            style={{ backgroundColor: '#0052CC' }}
          >
            Create Budget
          </Button>
        </Stack>
      </Modal>

      {/* Edit modal */}
      <Modal opened={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Budget" centered>
        <Stack gap="sm">
          <NumberInput
            label="Budget Amount"
            min={0.01}
            decimalScale={2}
            value={editAmount}
            onChange={setEditAmount}
          />
          <Button
            onClick={handleUpdate}
            loading={updateBudget.isPending}
            disabled={!editAmount}
            style={{ backgroundColor: '#0052CC' }}
          >
            Save Changes
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
