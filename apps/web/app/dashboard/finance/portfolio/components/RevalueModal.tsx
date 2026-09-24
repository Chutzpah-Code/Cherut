'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, Stack, Group, Text, NumberInput, TextInput, Button } from '@mantine/core';
import { useUpdateInvestment } from '@/hooks/useFinance';
import { FinanceInvestment } from '@/lib/api/services/finance';
import { useFinanceCurrency } from '../../currency-context';

// Quick single-asset revalue — a lighter alternative to the full Edit form
// when all that changed is the current value.
export function RevalueModal({
  investment, onClose,
}: {
  investment: FinanceInvestment | null;
  onClose: () => void;
}) {
  const t = useTranslations('finance.revalue');
  const tc = useTranslations('finance.common');
  const updateInvestment = useUpdateInvestment();
  const { displayCurrency: currency } = useFinanceCurrency();
  const [currentValue, setCurrentValue] = useState<number | string>(0);
  const [valuedDate, setValuedDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (investment) {
      setCurrentValue(investment.currentValue);
      setValuedDate(new Date().toISOString().slice(0, 10));
    }
  }, [investment]);

  const parsedValue = typeof currentValue === 'number' ? currentValue : parseFloat(currentValue as string);

  const handleSave = () => {
    if (!investment || isNaN(parsedValue) || parsedValue < 0) return;
    updateInvestment.mutate({ id: investment.id, dto: { currentValue: parsedValue, valuedDate } }, { onSuccess: onClose });
  };

  return (
    <Modal opened={!!investment} onClose={onClose} title={t('title', { name: investment?.name ?? '' })} centered size="sm">
      <Stack gap="sm">
        <NumberInput
          label={t('currentValue', { currency })}
          min={0}
          decimalScale={2}
          value={currentValue}
          onChange={setCurrentValue}
        />
        <TextInput label={t('valuedOn')} type="date" value={valuedDate} onChange={(e) => setValuedDate(e.target.value)} />
        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose}>{tc('cancel')}</Button>
          <Button onClick={handleSave} loading={updateInvestment.isPending} disabled={isNaN(parsedValue) || parsedValue < 0} style={{ backgroundColor: '#0052CC' }}>
            {tc('save')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
