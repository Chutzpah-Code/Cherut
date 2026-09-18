'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Modal, Stack, Group, Text, Center, Loader, Badge } from '@mantine/core';
import { useInvestmentValuations } from '@/hooks/useFinance';
import { FinanceInvestment } from '@/lib/api/services/finance';
import { fmtCurrency } from './billUtils';

export function ValuationHistoryModal({
  investment, onClose,
}: {
  investment: FinanceInvestment | null;
  onClose: () => void;
}) {
  const t = useTranslations('finance.valuationHistory');
  const locale = useLocale();
  const { data: valuations = [], isLoading } = useInvestmentValuations(investment?.id ?? '');

  return (
    <Modal opened={!!investment} onClose={onClose} title={t('title', { name: investment?.name ?? '' })} centered size="sm">
      {isLoading ? (
        <Center py="lg"><Loader size="sm" color="#4686FE" /></Center>
      ) : valuations.length === 0 ? (
        <Text size="sm" c="dimmed">{t('noHistory')}</Text>
      ) : (
        <Stack gap={6}>
          {valuations.map((v) => (
            <Group key={v.id} justify="space-between" style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px' }}>
              <Group gap={8}>
                <Text size="sm">{v.valuedOn}</Text>
                <Badge size="xs" variant="light" color={v.source === 'manual' ? 'blue' : 'gray'}>{v.source}</Badge>
              </Group>
              <Text size="sm" fw={600}>{fmtCurrency(v.value, locale, investment?.currency)}</Text>
            </Group>
          ))}
        </Stack>
      )}
    </Modal>
  );
}
