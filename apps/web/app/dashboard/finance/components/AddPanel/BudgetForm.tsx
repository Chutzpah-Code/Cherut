'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Stack, Select, NumberInput, Switch, Text } from '@mantine/core';
import { useFinanceCategories, useCreateBudget, useUpdateBudget } from '@/hooks/useFinance';
import { CreateBudgetDto } from '@/lib/api/services/finance';
import { useFinanceCurrency } from '../../currency-context';
import type { AddSubformHandle, AddSubformProps } from './types';

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthOptions(locale: string) {
  const fmtDate = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = -12; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    options.push({ value, label: fmtDate.format(d) });
  }
  return options;
}

export const BudgetForm = forwardRef<AddSubformHandle, AddSubformProps>(function BudgetForm(
  { mode, entity, prefill, onDone, onValidChange, onPendingChange },
  ref,
) {
  const t = useTranslations('finance.budgetForm');
  const locale = useLocale();
  const monthOpts = useMemo(() => monthOptions(locale), [locale]);
  const { data: categories = [] } = useFinanceCategories('expense');
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const { displayCurrency: currency } = useFinanceCurrency();

  const initial: Partial<CreateBudgetDto> & { repeatMonthly?: boolean } = mode === 'edit' && entity
    ? { categoryId: entity.categoryId, amount: entity.amount, month: entity.month }
    : { categoryId: prefill?.categoryId, month: currentMonth() };

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
        label={t('category')}
        placeholder={t('selectExpenseCategory')}
        data={categories.map((c: any) => ({ value: c.id, label: c.name }))}
        value={form.categoryId}
        onChange={(v) => setForm((f) => ({ ...f, categoryId: v ?? undefined }))}
      />
      <NumberInput
        label={t('monthlyAmount', { currency })}
        min={0.01}
        decimalScale={2}
        value={form.amount ?? ''}
        onChange={(v) => setForm((f) => ({ ...f, amount: typeof v === 'number' ? v : undefined }))}
      />
      <Select
        label={t('startingMonth')}
        data={monthOpts}
        value={form.month}
        onChange={(v) => setForm((f) => ({ ...f, month: v ?? currentMonth() }))}
        comboboxProps={{ withinPortal: true }}
      />
      <Switch label={t('repeatMonthly')} checked={repeatMonthly} onChange={(e) => setRepeatMonthly(e.currentTarget.checked)} />
      <Text size="xs" c="dimmed" style={{ background: '#F8FAFC', border: '1px solid #E8EBF0', borderRadius: 6, padding: 12 }}>
        {t('hint')}
      </Text>
    </Stack>
  );
});
