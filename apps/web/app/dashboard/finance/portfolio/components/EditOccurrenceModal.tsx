'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, Stack, Group, Text, Button, NumberInput, TextInput } from '@mantine/core';
import { useUpdateOccurrence } from '@/hooks/useBills';
import { FinanceBillOccurrence } from '@/lib/api/services/bills';

// Edits a single occurrence's amount/due date without touching the underlying
// bill rule — e.g. "this month's electricity bill was higher than usual."
export function EditOccurrenceModal({
  occurrence, onClose,
}: {
  occurrence: FinanceBillOccurrence | null;
  onClose: () => void;
}) {
  const t = useTranslations('finance.editOccurrence');
  const tc = useTranslations('finance.common');
  const updateOccurrence = useUpdateOccurrence();
  const [amount, setAmount] = useState<number | string>(0);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (occurrence) {
      setAmount(occurrence.amount);
      setDueDate(occurrence.dueDate);
    }
  }, [occurrence]);

  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount as string);

  const handleSave = () => {
    if (!occurrence || isNaN(parsedAmount) || parsedAmount <= 0 || !dueDate) return;
    updateOccurrence.mutate({ id: occurrence.id, dto: { amount: parsedAmount, dueDate } }, { onSuccess: onClose });
  };

  return (
    <Modal opened={!!occurrence} onClose={onClose} title={t('title', { name: occurrence?.bill?.name ?? '' })} centered size="sm">
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          {t('hint')}
        </Text>
        <NumberInput label={t('amount')} min={0.01} decimalScale={2} value={amount} onChange={setAmount} />
        <TextInput label={t('dueDate')} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose}>{tc('cancel')}</Button>
          <Button onClick={handleSave} loading={updateOccurrence.isPending} disabled={isNaN(parsedAmount) || parsedAmount <= 0 || !dueDate} style={{ backgroundColor: '#0052CC' }}>
            {tc('save')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
