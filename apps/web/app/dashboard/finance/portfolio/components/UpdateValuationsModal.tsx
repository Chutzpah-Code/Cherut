'use client';

import { useEffect, useState } from 'react';
import { Modal, Stack, Group, Text, Box, NumberInput, TextInput, Button } from '@mantine/core';
import { useBulkUpdateValuations } from '@/hooks/useFinance';
import { FinanceInvestment } from '@/lib/api/services/finance';

// Manual bulk revalue — automatic feed-priced valuations (tickers, FX, gold,
// vehicle tables) are out of scope for this rewrite; see FINANCE-SPEC.md §2.6
// scope note. This just lets the user type new values for several assets in
// one batch write.
export function UpdateValuationsModal({
  opened, onClose, investments,
}: {
  opened: boolean;
  onClose: () => void;
  investments: FinanceInvestment[];
}) {
  const bulkUpdate = useBulkUpdateValuations();
  const [values, setValues] = useState<Record<string, { currentValue: number; valuedDate: string }>>({});

  useEffect(() => {
    if (!opened) return;
    const initial: Record<string, { currentValue: number; valuedDate: string }> = {};
    for (const inv of investments) initial[inv.id] = { currentValue: inv.currentValue, valuedDate: new Date().toISOString().slice(0, 10) };
    setValues(initial);
  }, [opened, investments]);

  const handleSubmit = () => {
    const updates = Object.entries(values).map(([id, v]) => ({ id, ...v }));
    bulkUpdate.mutate(updates, { onSuccess: onClose });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Update valuations"
      centered
      size="lg"
      styles={{
        content: { display: 'flex', flexDirection: 'column', maxHeight: '85dvh', overflow: 'hidden' },
        body: { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 },
      }}
    >
      <Box px="md" py="xs" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Text size="xs" c="dimmed" mb="sm">
          Manual assets keep their last manual value until you update it here.
        </Text>
        <Stack gap="xs">
          {investments.map((inv) => (
            <Group key={inv.id} justify="space-between" wrap="nowrap" gap="sm">
              <Text size="sm" fw={500} style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {inv.name}
              </Text>
              <NumberInput
                size="xs"
                decimalScale={2}
                value={values[inv.id]?.currentValue ?? inv.currentValue}
                onChange={(v) => setValues((s) => ({ ...s, [inv.id]: { ...s[inv.id], currentValue: typeof v === 'number' ? v : 0 } }))}
                style={{ width: 130 }}
              />
              <TextInput
                size="xs"
                type="date"
                value={values[inv.id]?.valuedDate ?? ''}
                onChange={(e) => setValues((s) => ({ ...s, [inv.id]: { ...s[inv.id], valuedDate: e.target.value } }))}
                style={{ width: 140 }}
              />
            </Group>
          ))}
        </Stack>
      </Box>
      <Box px="md" py="sm" style={{ borderTop: '1px solid #E2E8F0', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={bulkUpdate.isPending} style={{ backgroundColor: '#0052CC' }}>
            Save valuations
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}
