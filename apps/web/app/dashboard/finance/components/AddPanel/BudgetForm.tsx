'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Stack, Select, NumberInput, Switch, Text } from '@mantine/core';
import { useFinanceCategories, useCreateBudget, useUpdateBudget } from '@/hooks/useFinance';
import { CreateBudgetDto } from '@/lib/api/services/finance';
import type { AddSubformHandle, AddSubformProps } from './types';

const CURRENCIES = ['USD', 'BRL', 'EUR', 'GBP', 'JPY', 'ARS'];

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthOptions() {
  const fmtDate = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = -12; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    options.push({ value, label: fmtDate.format(d) });
  }
  return options;
}
const MONTH_OPTIONS = monthOptions();

export const BudgetForm = forwardRef<AddSubformHandle, AddSubformProps>(function BudgetForm(
  { mode, entity, prefill, onDone, onValidChange, onPendingChange },
  ref,
) {
  const { data: categories = [] } = useFinanceCategories('expense');
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();

  const initial: Partial<CreateBudgetDto> & { repeatMonthly?: boolean } = mode === 'edit' && entity
    ? { categoryId: entity.categoryId, amount: entity.amount, month: entity.month, currency: entity.currency ?? 'USD' }
    : { categoryId: prefill?.categoryId, month: currentMonth(), currency: 'USD' };

  const [form, setForm] = useState(initial);
  const [repeatMonthly, setRepeatMonthly] = useState(true);
  const dirtyRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) dirtyRef.current = true;
    mountedRef.current = true;
  }, [form, repeatMonthly]);

  const valid = !!form.categoryId && !!form.amount && form.amount > 0 && !!form.month;
  useEffect(() => { onValidChange(valid); }, [valid, onValidChange]);

  const pending = createBudget.isPending || updateBudget.isPending;
  useEffect(() => { onPendingChange(pending); }, [pending, onPendingChange]);

  useImperativeHandle(ref, () => ({
    isDirty: () => dirtyRef.current,
    submit: () => {
      if (!valid) return;
      if (mode === 'edit' && entity) {
        updateBudget.mutate({ id: entity.id, dto: form }, { onSuccess: onDone });
      } else {
        createBudget.mutate(form as CreateBudgetDto, { onSuccess: onDone });
      }
    },
  }));

  return (
    <Stack gap="sm">
      <Select
        label="Category"
        placeholder="Select expense category"
        data={categories.map((c: any) => ({ value: c.id, label: c.name }))}
        value={form.categoryId}
        onChange={(v) => setForm((f) => ({ ...f, categoryId: v ?? undefined }))}
      />
      <NumberInput
        label={`Monthly amount (${form.currency ?? 'USD'})`}
        min={0.01}
        decimalScale={2}
        value={form.amount ?? ''}
        onChange={(v) => setForm((f) => ({ ...f, amount: typeof v === 'number' ? v : undefined }))}
      />
      <Select label="Currency" data={CURRENCIES} value={form.currency} onChange={(v) => setForm((f) => ({ ...f, currency: v ?? 'USD' }))} />
      <Select
        label="Starting month"
        data={MONTH_OPTIONS}
        value={form.month}
        onChange={(v) => setForm((f) => ({ ...f, month: v ?? currentMonth() }))}
        comboboxProps={{ withinPortal: true }}
      />
      <Switch label="Repeat every month" checked={repeatMonthly} onChange={(e) => setRepeatMonthly(e.currentTarget.checked)} />
      <Text size="xs" c="dimmed" style={{ background: '#F8FAFC', border: '1px solid #E8EBF0', borderRadius: 6, padding: 12 }}>
        Budgets live inside Spending by category on the Money page — there&apos;s no separate Budgets tab.
      </Text>
    </Stack>
  );
});
