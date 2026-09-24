'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Modal, Stack, Group, Text, NumberInput, TextInput, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCreateInvestmentEntry, useFinanceAccounts } from '@/hooks/useFinance';
import { FinanceInvestment, FinanceAccount } from '@/lib/api/services/finance';
import { fmtCurrency } from './billUtils';
import { useFinanceCurrency } from '../../currency-context';

// Scoped to assetClass === 'financial' — periodic deposits (brokerage,
// pension, crypto DCA) where "current value" and "total contributed" are
// both meaningful. Debits the linked account, if any, and grows the asset's
// currentValue by the same amount.
export function AddContributionModal({
  investment, onClose,
}: {
  investment: FinanceInvestment | null;
  onClose: () => void;
}) {
  const t = useTranslations('finance.addContribution');
  const tc = useTranslations('finance.common');
  const locale = useLocale();
  const createEntry = useCreateInvestmentEntry();
  const { data: accounts = [] } = useFinanceAccounts();
  const { displayCurrency: currency } = useFinanceCurrency();
  const [amount, setAmount] = useState<number | string>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount as string);
  const linkedAccount = (accounts as FinanceAccount[]).find((a) => a.id === investment?.linkedAccountId);
  const insufficientFunds = !!linkedAccount && !isNaN(parsedAmount) && parsedAmount > (linkedAccount.balance ?? 0);

  const handleSubmit = () => {
    if (!investment || isNaN(parsedAmount) || parsedAmount <= 0 || insufficientFunds) return;
    createEntry.mutate(
      { investmentId: investment.id, amount: parsedAmount, date },
      {
        onSuccess: () => { setAmount(''); onClose(); },
        onError: (error: any) => {
          notifications.show({ color: 'red', message: error?.response?.data?.message || t('genericError') });
        },
      },
    );
  };

  return (
    <Modal opened={!!investment} onClose={onClose} title={t('title', { name: investment?.name ?? '' })} centered size="sm">
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          {t('hint')}
        </Text>
        <NumberInput
          label={t('amount', { currency })}
          min={0.01}
          decimalScale={2}
          value={amount}
          onChange={setAmount}
        />
        {linkedAccount && (
          <Text size="xs" c={insufficientFunds ? 'red' : 'dimmed'}>
            {insufficientFunds
              ? t('insufficientBalance', { balance: fmtCurrency(linkedAccount.balance ?? 0, locale, currency) })
              : t('availableBalance', { balance: fmtCurrency(linkedAccount.balance ?? 0, locale, currency) })}
          </Text>
        )}
        <TextInput label={t('date')} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose}>{tc('cancel')}</Button>
          <Button onClick={handleSubmit} loading={createEntry.isPending} disabled={isNaN(parsedAmount) || parsedAmount <= 0 || insufficientFunds} style={{ backgroundColor: '#0052CC' }}>
            {t('addContribution')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
