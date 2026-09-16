'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Stack, Group, TextInput, Select, NumberInput, Switch } from '@mantine/core';
import { useFinanceAccounts, useFinanceCategories } from '@/hooks/useFinance';
import { useCreateBill, useUpdateBill } from '@/hooks/useBills';
import { CreateBillDto, BillFrequency } from '@/lib/api/services/bills';
import type { AddSubformHandle, AddSubformProps } from './types';

const FREQUENCY_OPTIONS: { value: BillFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'bimonthly', label: 'Bimonthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semiannual', label: 'Semiannual' },
  { value: 'annual', label: 'Annual' },
  { value: 'custom', label: 'Custom interval' },
];

const EMPTY: Partial<CreateBillDto> = {
  type: 'expense', frequency: 'monthly', dueDay: 1, interval: 30,
  startDate: new Date().toISOString().slice(0, 10), isActive: true,
};

export const BillRuleForm = forwardRef<AddSubformHandle, AddSubformProps>(function BillRuleForm(
  { mode, entity, onDone, onValidChange, onPendingChange },
  ref,
) {
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: categories = [] } = useFinanceCategories();
  const createBill = useCreateBill();
  const updateBill = useUpdateBill();

  const initial: Partial<CreateBillDto> = mode === 'edit' && entity
    ? {
        name: entity.name, accountId: entity.accountId, categoryId: entity.categoryId, amount: entity.amount,
        type: entity.type, frequency: entity.frequency, dueDay: entity.dueDay, interval: entity.interval,
        startDate: entity.startDate, endDate: entity.endDate, description: entity.description, isActive: entity.isActive,
      }
    : EMPTY;

  const [form, setForm] = useState<Partial<CreateBillDto>>(initial);
  const dirtyRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) dirtyRef.current = true;
    mountedRef.current = true;
  }, [form]);

  const valid = !!form.name && !!form.accountId && !!form.categoryId && !!form.amount && !!form.frequency
    && (form.frequency === 'custom' ? !!form.interval : !!form.dueDay) && !!form.startDate;
  useEffect(() => { onValidChange(valid); }, [valid, onValidChange]);

  const pending = createBill.isPending || updateBill.isPending;
  useEffect(() => { onPendingChange(pending); }, [pending, onPendingChange]);

  useImperativeHandle(ref, () => ({
    isDirty: () => dirtyRef.current,
    submit: () => {
      if (!valid) return;
      if (mode === 'edit' && entity) {
        updateBill.mutate({ id: entity.id, dto: form }, { onSuccess: onDone });
      } else {
        createBill.mutate(form as CreateBillDto, { onSuccess: onDone });
      }
    },
  }));

  const categoryOptions = (categories as any[]).filter((c) => c.type === form.type).map((c) => ({ value: c.id, label: c.name }));

  return (
    <Stack gap="sm">
      <TextInput label="Name" placeholder="e.g. Rent, Netflix, Salary" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      <Group grow>
        <NumberInput label="Amount" min={0.01} decimalScale={2} value={form.amount ?? ''} onChange={(v) => setForm((f) => ({ ...f, amount: typeof v === 'number' ? v : undefined }))} />
        <Select
          label="Frequency"
          data={FREQUENCY_OPTIONS}
          value={form.frequency}
          onChange={(v) => setForm((f) => ({ ...f, frequency: (v as BillFrequency) ?? 'monthly' }))}
        />
      </Group>
      <Group grow>
        <Select
          label="Account"
          placeholder="Select account"
          data={(accounts as any[]).map((a) => ({ value: a.id, label: a.name }))}
          value={form.accountId}
          onChange={(v) => setForm((f) => ({ ...f, accountId: v ?? undefined }))}
        />
        <Select
          label="Category"
          placeholder="Select category"
          data={categoryOptions}
          value={form.categoryId}
          onChange={(v) => setForm((f) => ({ ...f, categoryId: v ?? undefined }))}
        />
      </Group>
      <Group grow>
        <Select
          label="Type"
          data={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]}
          value={form.type}
          onChange={(v) => setForm((f) => ({ ...f, type: (v as any) ?? 'expense', categoryId: undefined }))}
        />
        {form.frequency === 'custom' ? (
          <NumberInput label="Repeats every (days)" min={1} value={form.interval ?? 30} onChange={(v) => setForm((f) => ({ ...f, interval: Number(v) || 1 }))} />
        ) : (
          <NumberInput label="Due day" description="Day of month (1–28)" min={1} max={28} value={form.dueDay ?? 1} onChange={(v) => setForm((f) => ({ ...f, dueDay: Number(v) || 1 }))} />
        )}
      </Group>
      <Group grow>
        <TextInput label="Starts" type="date" value={form.startDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
        <TextInput label="Ends (optional)" type="date" value={form.endDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value || undefined }))} />
      </Group>
      <Switch label="Active" checked={form.isActive ?? true} onChange={(e) => setForm((f) => ({ ...f, isActive: e.currentTarget.checked }))} />
    </Stack>
  );
});
