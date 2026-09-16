'use client';

import { useEffect, useState } from 'react';
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
    <Modal opened={!!occurrence} onClose={onClose} title={`Edit occurrence — ${occurrence?.bill?.name ?? ''}`} centered size="sm">
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          Changes here apply only to this occurrence — the recurring rule stays the same.
        </Text>
        <NumberInput label="Amount" min={0.01} decimalScale={2} value={amount} onChange={setAmount} />
        <TextInput label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={updateOccurrence.isPending} disabled={isNaN(parsedAmount) || parsedAmount <= 0 || !dueDate} style={{ backgroundColor: '#0052CC' }}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
