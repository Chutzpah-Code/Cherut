'use client';

import { useTranslations } from 'next-intl';
import { Stack, Group, Text, Select, NumberInput, TextInput, Textarea, Button } from '@mantine/core';
import { AlertTriangle } from 'lucide-react';
import { CreateTransactionDto, FinanceAccount } from '@/lib/api/services/finance';

export const EMPTY_TRANSACTION_FORM: Partial<CreateTransactionDto> = {
  type: 'expense',
  date: new Date().toISOString().slice(0, 10),
};

// Extracted from the pre-redesign page.tsx for continuity — reused by Block 3's
// quick-add/full form and later by Block 5's Add panel Transaction subform.
export function TransactionFormFields({
  form, setForm, formCurrency, accounts, categories,
  onAccountChange, onSubmit, loading, submitLabel, hideSubmit,
}: {
  form: Partial<CreateTransactionDto>;
  setForm: React.Dispatch<React.SetStateAction<Partial<CreateTransactionDto>>>;
  formCurrency: string;
  accounts: FinanceAccount[];
  categories: any[];
  onAccountChange: (id: string | null) => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel: string;
  hideSubmit?: boolean;
}) {
  const t = useTranslations('finance.transactionForm');
  if (accounts.length === 0) {
    return (
      <Stack gap="md" py="sm">
        <Group gap="sm" p="sm" style={{ background: '#fff8f0', borderRadius: 8, border: '1px solid #fed7aa' }}>
          <AlertTriangle size={15} color="#c2410c" style={{ flexShrink: 0 }} />
          <Text size="sm" style={{ color: '#9a3412' }}>
            {t('needAccount')}
          </Text>
        </Group>
        <Text size="xs" c="dimmed">{t('addAccountFirst')}</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Select
        label={t('type')}
        data={[{ value: 'income', label: t('income') }, { value: 'expense', label: t('expense') }]}
        value={form.type}
        onChange={(v) => setForm((f) => ({ ...f, type: v as any }))}
      />
      <Select
        label={t('account')}
        data={accounts.map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
        value={form.accountId}
        onChange={onAccountChange}
        placeholder={t('selectAccount')}
        required
      />
      <Select
        label={t('category')}
        data={categories.map((c: any) => ({ value: c.id, label: c.name }))}
        value={form.categoryId}
        onChange={(v) => setForm((f) => ({ ...f, categoryId: v ?? undefined }))}
        placeholder={t('uncategorized')}
        clearable
      />
      <NumberInput
        label={t('amount', { currency: formCurrency })}
        min={0}
        decimalScale={2}
        value={form.amount}
        onChange={(v) => setForm((f) => ({ ...f, amount: typeof v === 'number' ? v : undefined }))}
        leftSection={<Text size="xs" c="dimmed" fw={600}>{formCurrency}</Text>}
      />
      <TextInput
        label={t('date')}
        type="date"
        value={form.date}
        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
      />
      <TextInput
        label={t('description')}
        placeholder={t('optional')}
        value={form.description ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || undefined }))}
      />
      <Textarea
        label={t('notes')}
        placeholder={t('optional')}
        autosize
        minRows={2}
        maxRows={5}
        value={form.notes ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || undefined }))}
      />
      {!hideSubmit && (
        <Button
          onClick={onSubmit}
          loading={loading}
          disabled={!form.accountId || !form.amount}
          style={{ backgroundColor: '#0052CC' }}
        >
          {submitLabel}
        </Button>
      )}
    </Stack>
  );
}
