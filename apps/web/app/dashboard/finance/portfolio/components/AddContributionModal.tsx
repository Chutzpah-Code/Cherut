'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, Stack, Group, Text, NumberInput, TextInput, Button } from '@mantine/core';
import { useCreateInvestmentEntry } from '@/hooks/useFinance';
import { FinanceInvestment } from '@/lib/api/services/finance';

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
  const createEntry = useCreateInvestmentEntry();
  const [amount, setAmount] = useState<number | string>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount as string);

  const handleSubmit = () => {
    if (!investment || isNaN(parsedAmount) || parsedAmount <= 0) return;
    createEntry.mutate(
      { investmentId: investment.id, amount: parsedAmount, date },
      { onSuccess: () => { setAmount(''); onClose(); } },
    );
  };

  return (
    <Modal opened={!!investment} onClose={onClose} title={t('title', { name: investment?.name ?? '' })} centered size="sm">
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          {t('hint')}
        </Text>
        <NumberInput
          label={t('amount', { currency: investment?.currency ?? 'USD' })}
          min={0.01}
          decimalScale={2}
          value={amount}
          onChange={setAmount}
        />
        <TextInput label={t('date')} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose}>{tc('cancel')}</Button>
          <Button onClick={handleSubmit} loading={createEntry.isPending} disabled={isNaN(parsedAmount) || parsedAmount <= 0} style={{ backgroundColor: '#0052CC' }}>
            {t('addContribution')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
