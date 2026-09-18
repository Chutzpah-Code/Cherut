'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Group, TextInput, Select, NumberInput, Text, UnstyledButton } from '@mantine/core';
import { useCreateAccount, useUpdateAccount } from '@/hooks/useFinance';
import { CreateAccountDto } from '@/lib/api/services/finance';
import type { AddSubformHandle, AddSubformProps } from './types';

const CURRENCIES = [
  { value: 'USD', label: 'USD — Dollar' },
  { value: 'BRL', label: 'BRL — Real' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — Pound' },
  { value: 'JPY', label: 'JPY — Yen' },
  { value: 'ARS', label: 'ARS — Peso' },
];

export const AccountForm = forwardRef<AddSubformHandle, AddSubformProps & { forcedType?: 'credit' }>(function AccountForm(
  { mode, entity, onDone, onValidChange, onPendingChange, forcedType },
  ref,
) {
  const t = useTranslations('finance.accountForm');
  const ACCOUNT_TYPES = [
    { value: 'checking', label: t('typeChecking') },
    { value: 'wallet', label: t('typeWallet') },
    { value: 'savings', label: t('typeSavings') },
    { value: 'credit', label: t('typeCredit') },
  ];
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const initial: Partial<CreateAccountDto> = mode === 'edit' && entity
    ? {
        name: entity.name, type: entity.type, currency: entity.currency, balance: entity.balance,
        creditLimit: entity.creditLimit, statementClosingDay: entity.statementClosingDay, statementDueDay: entity.statementDueDay,
      }
    : { type: forcedType ?? 'checking', currency: 'USD', balance: 0 };

  const [form, setForm] = useState<Partial<CreateAccountDto>>(initial);
  const dirtyRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) dirtyRef.current = true;
    mountedRef.current = true;
  }, [form]);

  const valid = !!form.name && !!form.type;
  useEffect(() => { onValidChange(valid); }, [valid, onValidChange]);
  const pending = createAccount.isPending || updateAccount.isPending;
  useEffect(() => { onPendingChange(pending); }, [pending, onPendingChange]);

  useImperativeHandle(ref, () => ({
    isDirty: () => dirtyRef.current,
    submit: () => {
      if (!valid) return;
      if (mode === 'edit' && entity) {
        updateAccount.mutate({ id: entity.id, dto: form }, { onSuccess: onDone });
      } else {
        createAccount.mutate(form as CreateAccountDto, { onSuccess: onDone });
      }
    },
  }));

  const isCredit = forcedType === 'credit' || form.type === 'credit';

  return (
    <Stack gap="sm">
      <TextInput
        label={t('name')}
        placeholder={forcedType === 'credit' ? t('namePlaceholderCard') : t('namePlaceholderAccount')}
        value={form.name ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      {!forcedType && (
        <Stack gap={7}>
          <Text size="xs" fw={600} c="#334155">{t('type')}</Text>
          <Group gap={6} wrap="wrap">
            {ACCOUNT_TYPES.map((opt) => (
              <UnstyledButton
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, type: opt.value as any }))}
                style={{
                  fontSize: 12.5, fontWeight: 600, padding: '8px 12px', borderRadius: 6,
                  color: form.type === opt.value ? '#1D4ED8' : '#334155',
                  background: form.type === opt.value ? '#E4EBFD' : '#F1F5F9',
                }}
              >
                {opt.label}
              </UnstyledButton>
            ))}
          </Group>
        </Stack>
      )}
      <Select label={t('currency')} data={CURRENCIES} value={form.currency} onChange={(v) => setForm((f) => ({ ...f, currency: v ?? 'USD' }))} />
      <NumberInput
        label={mode === 'edit' ? t('balance', { currency: form.currency ?? 'USD' }) : t('initialBalance', { currency: form.currency ?? 'USD' })}
        value={form.balance}
        onChange={(v) => setForm((f) => ({ ...f, balance: typeof v === 'number' ? v : 0 }))}
        decimalScale={2}
      />
      {isCredit && (
        <>
          <Text size="xs" c="dimmed" style={{ background: '#F8FAFC', border: '1px solid #E8EBF0', borderRadius: 6, padding: 12 }}>
            {forcedType ? t('creditNoteForced') : t('creditNoteGeneral')}
          </Text>
          <NumberInput
            label={t('creditLimit', { currency: form.currency ?? 'USD' })}
            min={0}
            decimalScale={2}
            value={form.creditLimit ?? ''}
            onChange={(v) => setForm((f) => ({ ...f, creditLimit: typeof v === 'number' ? v : undefined }))}
          />
          <NumberInput
            label={t('statementClosingDay')}
            description={t('statementClosingDayDesc')}
            min={1}
            max={28}
            value={form.statementClosingDay ?? ''}
            onChange={(v) => setForm((f) => ({ ...f, statementClosingDay: typeof v === 'number' ? v : undefined }))}
          />
          <NumberInput
            label={t('paymentDueDay')}
            description={t('paymentDueDayDesc')}
            min={1}
            max={28}
            value={form.statementDueDay ?? ''}
            onChange={(v) => setForm((f) => ({ ...f, statementDueDay: typeof v === 'number' ? v : undefined }))}
          />
        </>
      )}
    </Stack>
  );
});
