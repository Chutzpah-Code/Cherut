'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Switch } from '@mantine/core';
import { useFinanceAccounts, useFinanceCategories, useCreateTransaction, useUpdateTransaction } from '@/hooks/useFinance';
import { useCreateBill } from '@/hooks/useBills';
import { CreateTransactionDto, FinanceAccount } from '@/lib/api/services/finance';
import { TransactionFormFields, EMPTY_TRANSACTION_FORM } from '../TransactionFormFields';
import { useFinanceCurrency } from '../../currency-context';
import type { AddSubformHandle, AddSubformProps } from './types';

export const TransactionForm = forwardRef<AddSubformHandle, AddSubformProps>(function TransactionForm(
  { mode, entity, prefill, onDone, onValidChange, onPendingChange },
  ref,
) {
  const t = useTranslations('finance.transactionForm');
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: categories = [] } = useFinanceCategories();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const createBill = useCreateBill();
  const { displayCurrency: currency } = useFinanceCurrency();

  const initial: Partial<CreateTransactionDto> = mode === 'edit' && entity
    ? {
        accountId: entity.accountId, categoryId: entity.categoryId, amount: entity.amount,
        type: entity.type, date: entity.date, description: entity.description,
        toAccountId: entity.toAccountId,
      }
    : { ...EMPTY_TRANSACTION_FORM, ...prefill };

  const [form, setForm] = useState<Partial<CreateTransactionDto>>(initial);
  const [makeRecurring, setMakeRecurring] = useState(false);
  const dirtyRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) dirtyRef.current = true;
    mountedRef.current = true;
  }, [form, makeRecurring]);

  const valid = !!form.accountId && !!form.amount && !!form.type && !!form.date
    && (form.type !== 'transfer' || !!form.toAccountId);
  useEffect(() => { onValidChange(valid); }, [valid, onValidChange]);

  const pending = createTx.isPending || updateTx.isPending || createBill.isPending;
  useEffect(() => { onPendingChange(pending); }, [pending, onPendingChange]);

  const handleAccountChange = (accountId: string | null) => {
    setForm((f) => ({ ...f, accountId: accountId ?? undefined }));
  };

  useImperativeHandle(ref, () => ({
    isDirty: () => dirtyRef.current,
    submit: () => {
      if (!valid) return;
      if (mode === 'edit' && entity) {
        updateTx.mutate({ id: entity.id, dto: form }, { onSuccess: onDone });
        return;
      }
      createTx.mutate(form as CreateTransactionDto, {
        onSuccess: () => {
          if (makeRecurring && form.accountId && form.categoryId && form.amount && form.date) {
            const day = Number(form.date.slice(8, 10)) || 1;
            createBill.mutate({
              name: form.description || t('recurringTransactionDefaultName'),
              accountId: form.accountId,
              categoryId: form.categoryId,
              amount: form.amount,
              type: form.type === 'income' ? 'income' : 'expense',
              frequency: 'monthly',
              dueDay: Math.min(day, 28),
              startDate: form.date,
              isActive: true,
            });
          }
          onDone();
        },
      });
    },
  }));

  return (
    <>
      <TransactionFormFields
        form={form}
        setForm={setForm}
        formCurrency={currency}
        accounts={accounts as FinanceAccount[]}
        categories={categories}
        onAccountChange={handleAccountChange}
        onSubmit={() => {}}
        loading={pending}
        submitLabel=""
        hideSubmit
      />
      {mode === 'create' && form.type !== 'transfer' && (
        <Switch
          mt="sm"
          label={t('makeRecurring')}
          checked={makeRecurring}
          onChange={(e) => setMakeRecurring(e.currentTarget.checked)}
        />
      )}
    </>
  );
});
