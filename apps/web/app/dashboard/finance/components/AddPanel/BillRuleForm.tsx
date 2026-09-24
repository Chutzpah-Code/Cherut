'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Group, TextInput, Select, NumberInput, Switch, Text } from '@mantine/core';
import { useFinanceAccounts, useFinanceCategories } from '@/hooks/useFinance';
import { useCreateBill, useUpdateBill } from '@/hooks/useBills';
import { CreateBillDto, BillFrequency } from '@/lib/api/services/bills';
import { useFinanceCurrency } from '../../currency-context';
import type { AddSubformHandle, AddSubformProps } from './types';

const EMPTY: Partial<CreateBillDto> = {
  type: 'expense', frequency: 'monthly', dueDay: 1, interval: 30,
  startDate: new Date().toISOString().slice(0, 10), isActive: true,
};

export const BillRuleForm = forwardRef<AddSubformHandle, AddSubformProps>(function BillRuleForm(
  { mode, entity, onDone, onValidChange, onPendingChange },
  ref,
) {
  const t = useTranslations('finance.billRuleForm');
  const tc = useTranslations('finance.common');
  const FREQUENCY_OPTIONS: { value: BillFrequency; label: string }[] = [
    { value: 'weekly', label: tc('freqWeekly') },
    { value: 'biweekly', label: tc('freqBiweekly') },
    { value: 'monthly', label: tc('freqMonthly') },
    { value: 'bimonthly', label: tc('freqBimonthly') },
    { value: 'quarterly', label: tc('freqQuarterly') },
    { value: 'semiannual', label: tc('freqSemiannual') },
    { value: 'annual', label: tc('freqAnnual') },
    { value: 'custom', label: t('freqCustomInterval') },
  ];
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: categories = [] } = useFinanceCategories();
  const createBill = useCreateBill();
  const updateBill = useUpdateBill();
  const { displayCurrency: currency } = useFinanceCurrency();

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
      <TextInput label={t('name')} placeholder={t('namePlaceholder')} value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      <Group grow>
        <NumberInput
          label={t('amount', { currency })}
          leftSection={<Text size="xs" c="dimmed" fw={600}>{currency}</Text>}
          min={0.01}
          decimalScale={2}
          value={form.amount ?? ''}
          onChange={(v) => setForm((f) => ({ ...f, amount: typeof v === 'number' ? v : undefined }))}
        />
        <Select
          label={t('frequency')}
          data={FREQUENCY_OPTIONS}
          value={form.frequency}
          onChange={(v) => setForm((f) => ({ ...f, frequency: (v as BillFrequency) ?? 'monthly' }))}
        />
      </Group>
      <Group grow>
        <Select
          label={t('account')}
          placeholder={t('selectAccount')}
          data={(accounts as any[]).map((a) => ({ value: a.id, label: a.name }))}
          value={form.accountId}
          onChange={(v) => setForm((f) => ({ ...f, accountId: v ?? undefined }))}
        />
        <Select
          label={t('category')}
          placeholder={t('selectCategory')}
          data={categoryOptions}
          value={form.categoryId}
          onChange={(v) => setForm((f) => ({ ...f, categoryId: v ?? undefined }))}
        />
      </Group>
      <Group grow>
        <Select
          label={t('type')}
          data={[{ value: 'expense', label: t('expense') }, { value: 'income', label: t('income') }]}
          value={form.type}
          onChange={(v) => setForm((f) => ({ ...f, type: (v as any) ?? 'expense', categoryId: undefined }))}
        />
        {form.frequency === 'custom' ? (
          <NumberInput label={t('repeatsEveryDays')} min={1} value={form.interval ?? 30} onChange={(v) => setForm((f) => ({ ...f, interval: Number(v) || 1 }))} />
        ) : (
          <NumberInput label={t('dueDay')} description={t('dueDayDesc')} min={1} max={28} value={form.dueDay ?? 1} onChange={(v) => setForm((f) => ({ ...f, dueDay: Number(v) || 1 }))} />
        )}
      </Group>
      <Group grow>
        <TextInput label={t('starts')} type="date" value={form.startDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
        <TextInput label={t('endsOptional')} type="date" value={form.endDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value || undefined }))} />
      </Group>
      <Switch label={t('active')} checked={form.isActive ?? true} onChange={(e) => setForm((f) => ({ ...f, isActive: e.currentTarget.checked }))} />
    </Stack>
  );
});
