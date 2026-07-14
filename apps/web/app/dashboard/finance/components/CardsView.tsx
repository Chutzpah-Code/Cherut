'use client';

import { useState } from 'react';
import {
  Stack, Group, Text, Box, Badge, Button, Loader, Center,
  Card, Progress, Modal, Select, NumberInput, Collapse,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CreditCard, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import {
  useFinanceAccounts,
  useFinanceCategories,
  useCurrentStatement,
  useStatements,
  useCloseStatement,
  usePayStatement,
} from '@/hooks/useFinance';
import { FinanceAccount, FinanceStatement } from '@/lib/api/services/finance';

function fmt(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    open: { color: 'blue', label: 'Open' },
    closed: { color: 'orange', label: 'Pending payment' },
    paid: { color: 'green', label: 'Paid' },
  };
  const { color, label } = map[status] ?? { color: 'gray', label: status };
  return <Badge size="xs" color={color} variant="light">{label}</Badge>;
}

function PayModal({
  opened, onClose, statement, cardAccount, accounts,
}: {
  opened: boolean;
  onClose: () => void;
  statement: FinanceStatement;
  cardAccount: FinanceAccount;
  accounts: FinanceAccount[];
}) {
  const payStatement = usePayStatement();
  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | string>(statement.total);
  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount as string);
  const checkingAccounts = accounts.filter((a) => a.id !== cardAccount.id && a.type !== 'credit');

  const handlePay = () => {
    if (!fromAccountId || isNaN(parsedAmount) || parsedAmount <= 0) return;
    payStatement.mutate(
      { accountId: cardAccount.id, statementId: statement.id, dto: { fromAccountId, amount: parsedAmount } },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Pay statement" centered>
      <Stack gap="sm">
        <Box style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 16px' }}>
          <Text size="xs" c="dimmed">Statement total</Text>
          <Text size="xl" fw={700} c="green.7">{fmt(statement.total, cardAccount.currency)}</Text>
          <Text size="xs" c="dimmed">Due: {fmtDate(statement.dueDate)}</Text>
        </Box>
        <Select
          label="Pay from"
          placeholder="Select account"
          required
          data={checkingAccounts.map((a) => ({
            value: a.id,
            label: `${a.name} — ${fmt(a.balance, a.currency)}`,
          }))}
          value={fromAccountId}
          onChange={setFromAccountId}
        />
        <NumberInput
          label="Amount"
          min={0.01}
          decimalScale={2}
          value={amount}
          onChange={setAmount}
          leftSection={<Text size="xs" c="dimmed" fw={600}>{cardAccount.currency}</Text>}
        />
        <Button
          onClick={handlePay}
          loading={payStatement.isPending}
          disabled={!fromAccountId || isNaN(parsedAmount) || parsedAmount <= 0}
          color="green"
        >
          Confirm payment
        </Button>
      </Stack>
    </Modal>
  );
}

function CardPanel({ account, accounts }: { account: FinanceAccount; accounts: FinanceAccount[] }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [payModal, { open: openPay, close: closePay }] = useDisclosure();
  const [selectedStatement, setSelectedStatement] = useState<FinanceStatement | null>(null);
  const closeStatement = useCloseStatement();

  const { data: current, isLoading: currentLoading } = useCurrentStatement(account.id);
  const { data: statements = [], isLoading: stmtsLoading } = useStatements(historyOpen ? account.id : '');

  const used = Math.abs(account.balance ?? 0);
  const limit = account.creditLimit ?? 0;
  const available = limit > 0 ? limit - used : null;
  const utilization = limit > 0 ? Math.min(100, (used / limit) * 100) : null;
  const utilizationColor = utilization == null ? 'blue' : utilization > 80 ? 'red' : utilization > 50 ? 'orange' : 'green';

  const handleOpenPay = (stmt: FinanceStatement) => {
    setSelectedStatement(stmt);
    openPay();
  };

  return (
    <Card withBorder radius="md" p="md">
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Box style={{ background: '#EFF6FF', borderRadius: 8, padding: 8 }}>
            <CreditCard size={18} color="#0052CC" />
          </Box>
          <Box>
            <Text fw={600} size="sm">{account.name}</Text>
            <Text size="xs" c="dimmed">{account.currency}</Text>
          </Box>
        </Group>
        {account.statementClosingDay && (
          <Text size="xs" c="dimmed">Closes day {account.statementClosingDay} · Due day {account.statementDueDay}</Text>
        )}
      </Group>

      {/* Limit bar */}
      {limit > 0 && (
        <Box mb="md">
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">Used</Text>
            <Text size="xs" fw={600}>{fmt(used, account.currency)} / {fmt(limit, account.currency)}</Text>
          </Group>
          <Progress value={utilization!} color={utilizationColor} radius="xl" size="sm" />
          {available !== null && (
            <Text size="xs" c="dimmed" mt={4}>Available: <Text span fw={600} c="green.7">{fmt(available, account.currency)}</Text></Text>
          )}
        </Box>
      )}

      {/* Current statement */}
      <Box style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 16px' }} mb="md">
        <Group justify="space-between" mb={4}>
          <Text size="xs" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current statement</Text>
          <StatusBadge status="open" />
        </Group>

        {currentLoading ? (
          <Center py="xs"><Loader size="xs" /></Center>
        ) : current ? (
          <>
            <Text size="xl" fw={700} c="#0F172A">{fmt(current.total, account.currency)}</Text>
            <Text size="xs" c="dimmed" mt={2}>
              {fmtDate(current.periodStart)} → {fmtDate(current.periodEnd)} · Due {fmtDate(current.dueDate)}
            </Text>
            <Group mt="sm" gap="xs">
              <Button
                size="xs"
                variant="light"
                onClick={() => closeStatement.mutate(account.id)}
                loading={closeStatement.isPending}
              >
                Close statement
              </Button>
            </Group>
          </>
        ) : (
          <Text size="sm" c="dimmed">No transactions this period.</Text>
        )}
      </Box>

      {/* History toggle */}
      <Button
        variant="subtle"
        size="xs"
        color="gray"
        leftSection={historyOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        onClick={() => setHistoryOpen((v) => !v)}
        mb={historyOpen ? 'xs' : 0}
      >
        Statement history
      </Button>

      <Collapse in={historyOpen}>
        {stmtsLoading ? (
          <Center py="sm"><Loader size="xs" /></Center>
        ) : statements.length === 0 ? (
          <Text size="xs" c="dimmed" px="xs">No closed statements yet.</Text>
        ) : (
          <Stack gap={6}>
            {(statements as FinanceStatement[]).map((stmt) => (
              <Box
                key={stmt.id}
                style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px' }}
              >
                <Group justify="space-between">
                  <Box>
                    <Group gap={6}>
                      <Text size="xs" c="dimmed">{fmtDate(stmt.periodEnd)}</Text>
                      <StatusBadge status={stmt.status} />
                    </Group>
                    <Text size="sm" fw={600}>{fmt(stmt.total, account.currency)}</Text>
                    <Text size="xs" c="dimmed">Due {fmtDate(stmt.dueDate)}</Text>
                  </Box>
                  {stmt.status === 'closed' && (
                    <Button size="xs" color="green" variant="light" onClick={() => handleOpenPay(stmt)}>
                      Pay
                    </Button>
                  )}
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Collapse>

      {selectedStatement && (
        <PayModal
          opened={payModal}
          onClose={closePay}
          statement={selectedStatement}
          cardAccount={account}
          accounts={accounts}
        />
      )}
    </Card>
  );
}

export function CardsView() {
  const { data: accounts = [], isLoading } = useFinanceAccounts();

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  const creditCards = (accounts as FinanceAccount[]).filter((a) => a.type === 'credit');

  if (creditCards.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <AlertCircle size={32} color="#94A3B8" />
          <Text c="dimmed" size="sm">No credit cards added yet.</Text>
          <Text c="dimmed" size="xs">Create an account of type "Credit" in the Accounts tab.</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      {creditCards.map((card) => (
        <CardPanel key={card.id} account={card} accounts={accounts as FinanceAccount[]} />
      ))}
    </Stack>
  );
}
