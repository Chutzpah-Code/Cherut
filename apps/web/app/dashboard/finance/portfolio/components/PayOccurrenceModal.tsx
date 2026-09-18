'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, Stack, Group, Text, Box, TextInput, Select, NumberInput, Button } from '@mantine/core';
import { useFinanceAccounts } from '@/hooks/useFinance';
import { usePayOccurrence } from '@/hooks/useBills';
import { FinanceBillOccurrence } from '@/lib/api/services/bills';

export function PayOccurrenceModal({
  occurrence, opened, onClose,
}: {
  occurrence: FinanceBillOccurrence | null;
  opened: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('finance.payOccurrence');
  const tc = useTranslations('finance.common');
  const today = new Date().toISOString().slice(0, 10);
  const { data: accounts = [] } = useFinanceAccounts();
  const payMutation = usePayOccurrence();

  const [accountId, setAccountId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState(0);
  const [paidAt, setPaidAt] = useState(today);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (occurrence && opened) {
      setAmount(occurrence.amount);
      setPaidAt(today);
      setNotes('');
      const billAccount = (accounts as any[]).find((a) => a.id === occurrence.bill?.accountId);
      setAccountId(billAccount?.id ?? '');
      setCurrency(billAccount?.currency ?? 'USD');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occurrence, opened]);

  const handlePay = () => {
    if (!occurrence || !accountId || amount <= 0) return;
    payMutation.mutate(
      { id: occurrence.id, dto: { accountId, amount, paidAt, notes: notes || undefined } },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('title', { name: occurrence?.bill?.name ?? '' })}
      size="sm"
      centered
      styles={{
        content: { display: 'flex', flexDirection: 'column', maxHeight: '85dvh', overflow: 'hidden' },
        body: { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 },
      }}
    >
      <Box px="md" py="xs" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        <Stack gap="sm">
          <Select
            label={t('account')}
            placeholder={t('selectAccount')}
            data={(accounts as any[]).map((a) => ({ value: a.id, label: `${a.name} (${a.currency ?? 'USD'})` }))}
            value={accountId}
            onChange={(v) => {
              setAccountId(v ?? '');
              setCurrency((accounts as any[]).find((a) => a.id === v)?.currency ?? 'USD');
            }}
            required
          />
          <NumberInput
            label={t('amount')}
            min={0.01}
            decimalScale={2}
            value={amount}
            onChange={(v) => setAmount(Number(v) || 0)}
            leftSection={<Text size="xs" fw={600}>{currency}</Text>}
            required
          />
          <TextInput label={t('paymentDate')} type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required />
          <TextInput label={t('notesOptional')} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Stack>
      </Box>
      <Box px="md" py="sm" style={{ borderTop: '1px solid #E2E8F0', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>{tc('cancel')}</Button>
          <Button onClick={handlePay} loading={payMutation.isPending} disabled={!accountId || amount <= 0} style={{ backgroundColor: '#0052CC' }}>
            {t('confirmPayment')}
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}
