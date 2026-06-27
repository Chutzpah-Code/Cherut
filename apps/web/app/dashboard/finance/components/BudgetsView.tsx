'use client';

import { useState } from 'react';
import {
  Stack, Group, Text, Box, Button, Loader, Center,
  Modal, Select, NumberInput, ActionIcon, Card, Progress,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus, Trash2 } from 'lucide-react';
import {
  useFinanceBudgets, useFinanceCategories,
  useCreateBudget, useDeleteBudget,
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

export function BudgetsView() {
  const [opened, { open, close }] = useDisclosure();
  const [month, setMonth] = useState(currentMonth());
  const { data: budgets = [], isLoading } = useFinanceBudgets(month);
  const { data: categories = [] } = useFinanceCategories('expense');
  const createBudget = useCreateBudget();
  const deleteBudget = useDeleteBudget();

  const categoryMap = Object.fromEntries(categories.map((c: any) => [c.id, c]));

  const [form, setForm] = useState<Partial<CreateBudgetDto>>({ month: currentMonth() });

  const handleCreate = () => {
    if (!form.categoryId || !form.amount || !form.month) return;
    createBudget.mutate(form as CreateBudgetDto, { onSuccess: close });
  };

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Text fw={600} size="sm" c="dimmed">Budgets</Text>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ border: '1px solid #E2E8F0', borderRadius: 6, padding: '2px 8px', fontSize: 13, color: '#42526E' }}
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
            min={0}
            decimalScale={2}
            value={form.amount}
            onChange={(v) => setForm((f) => ({ ...f, amount: typeof v === 'number' ? v : undefined }))}
          />
          <Box>
            <Text size="sm" fw={500} mb={4}>Month</Text>
            <input
              type="month"
              value={form.month ?? currentMonth()}
              onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
              style={{ border: '1px solid #ced4da', borderRadius: 6, padding: '6px 10px', fontSize: 14, width: '100%' }}
            />
          </Box>
          <Button
            onClick={handleCreate}
            loading={createBudget.isPending}
            disabled={!form.categoryId || !form.amount}
            style={{ backgroundColor: '#0052CC' }}
          >
            Create Budget
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
