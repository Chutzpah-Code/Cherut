'use client';

import { useEffect, useState } from 'react';
import { Modal, Stack, Group, Text, Box, Select, NumberInput, Button, Center, Loader } from '@mantine/core';
import { useFinanceAccounts, useCloseStatement, usePayStatement } from '@/hooks/useFinance';
import { FinanceAccount, FinanceStatement } from '@/lib/api/services/finance';
import { fmtCurrency } from './billUtils';

// Triggered from "Mark paid" on a synthesized credit-card-statement row in
// Upcoming bills — closes the live-computed statement (snapshotting it) then
// immediately opens the pay form for it, so it reads as one action to the user.
export function PayCardStatementModal({
  opened, onClose, accountId,
}: {
  opened: boolean;
  onClose: () => void;
  accountId: string | null;
}) {
  const { data: accounts = [] } = useFinanceAccounts();
  const closeStatement = useCloseStatement();
  const payStatement = usePayStatement();

  const [statement, setStatement] = useState<FinanceStatement | null>(null);
  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | string>(0);

  const cardAccount = (accounts as FinanceAccount[]).find((a) => a.id === accountId) ?? null;

  useEffect(() => {
    if (opened && accountId) {
      setStatement(null);
      closeStatement.mutate(accountId, {
        onSuccess: (stmt) => {
          setStatement(stmt);
          setAmount(stmt.total);
        },
      });
    } else {
      setStatement(null);
      setFromAccountId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, accountId]);

  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount as string);
  const cashAccounts = (accounts as FinanceAccount[]).filter((a) => a.id !== accountId && a.type !== 'credit');

  const handlePay = () => {
    if (!statement || !accountId || !fromAccountId || isNaN(parsedAmount) || parsedAmount <= 0) return;
    payStatement.mutate(
      { accountId, statementId: statement.id, dto: { fromAccountId, amount: parsedAmount } },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={cardAccount ? `Pay ${cardAccount.name} statement` : 'Pay statement'}
      centered
      styles={{
        content: { display: 'flex', flexDirection: 'column', maxHeight: '85dvh', overflow: 'hidden' },
        body: { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 },
      }}
    >
      <Box px="md" py="xs" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        {!statement ? (
          <Center py="lg"><Loader size="sm" color="#4686FE" /></Center>
        ) : (
          <Stack gap="sm">
            <Box style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 16px' }}>
              <Text size="xs" c="dimmed">Statement total</Text>
              <Text size="xl" fw={700} c="green.7">{fmtCurrency(statement.total, cardAccount?.currency)}</Text>
            </Box>
            <Select
              label="Pay from"
              placeholder="Select account"
              required
              data={cashAccounts.map((a) => ({ value: a.id, label: `${a.name} — ${fmtCurrency(a.balance, a.currency)}` }))}
              value={fromAccountId}
              onChange={setFromAccountId}
            />
            <NumberInput
              label="Amount"
              min={0.01}
              decimalScale={2}
              value={amount}
              onChange={setAmount}
              leftSection={<Text size="xs" c="dimmed" fw={600}>{cardAccount?.currency}</Text>}
            />
          </Stack>
        )}
      </Box>
      <Box px="md" py="sm" style={{ borderTop: '1px solid #E2E8F0', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handlePay}
            loading={payStatement.isPending}
            disabled={!statement || !fromAccountId || isNaN(parsedAmount) || parsedAmount <= 0}
            color="green"
          >
            Confirm payment
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}
