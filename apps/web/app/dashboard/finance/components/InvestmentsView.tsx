'use client';

import { useState } from 'react';
import {
  Stack, Group, Text, Box, Badge, Button, Loader, Center,
  Modal, Select, NumberInput, TextInput, ActionIcon, Card, Collapse,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  useFinanceInvestments, useCreateInvestment, useDeleteInvestment,
  useInvestmentEntries, useCreateInvestmentEntry, useDeleteInvestmentEntry,
} from '@/hooks/useFinance';
import { CreateInvestmentDto, CreateInvestmentEntryDto, FinanceInvestment } from '@/lib/api/services/finance';

function fmt(value: number, currency?: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency ?? 'USD' }).format(value);
  } catch {
    return `${currency ?? ''} ${value.toFixed(2)}`;
  }
}

const TYPE_LABELS: Record<string, string> = {
  stock: 'Stock', crypto: 'Crypto', fund: 'Fund', real_estate: 'Real Estate', other: 'Other',
};

function InvestmentCard({ inv, onDelete }: { inv: FinanceInvestment; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [entryModal, { open: openEntry, close: closeEntry }] = useDisclosure();
  const { data: entries = [], isLoading: entriesLoading } = useInvestmentEntries(expanded ? inv.id : '');
  const createEntry = useCreateInvestmentEntry();
  const deleteEntry = useDeleteInvestmentEntry();

  const [entryForm, setEntryForm] = useState<Partial<CreateInvestmentEntryDto>>({
    investmentId: inv.id,
    date: new Date().toISOString().slice(0, 10),
  });

  const handleCreateEntry = () => {
    if (!entryForm.amount || !entryForm.date) return;
    createEntry.mutate(
      { ...entryForm, investmentId: inv.id } as CreateInvestmentEntryDto,
      { onSuccess: closeEntry },
    );
  };

  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={expanded ? 'sm' : 0}>
        <Box style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded((v) => !v)}>
          <Group gap="xs">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Text size="sm" fw={600}>{inv.name}</Text>
            <Badge size="xs" variant="light">{TYPE_LABELS[inv.type] ?? inv.type}</Badge>
            {inv.ticker && <Badge size="xs" variant="outline" color="gray">{inv.ticker}</Badge>}
          </Group>
          <Text size="xs" c="dimmed" ml={22} mt={2}>
            Total contributed: {fmt(inv.totalContributed, inv.currency)}
          </Text>
        </Box>
        <ActionIcon size="sm" variant="subtle" color="red" onClick={onDelete}>
          <Trash2 size={14} />
        </ActionIcon>
      </Group>

      <Collapse in={expanded}>
        <Box mt="sm" style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12 }}>
          <Group justify="space-between" mb="xs">
            <Text size="xs" fw={600} c="dimmed">Contributions</Text>
            <Button size="xs" variant="subtle" leftSection={<Plus size={12} />} onClick={openEntry}>
              Add
            </Button>
          </Group>

          {entriesLoading ? (
            <Center py="sm"><Loader size="xs" /></Center>
          ) : entries.length === 0 ? (
            <Text size="xs" c="dimmed">No contributions yet.</Text>
          ) : (
            <Stack gap={4}>
              {entries.map((entry: any) => (
                <Group key={entry.id} justify="space-between" px="xs" py={4}
                  style={{ borderRadius: 6, background: '#f8fafc' }}>
                  <Text size="xs" c="dimmed">{entry.date}</Text>
                  <Group gap="xs">
                    <Text size="xs" fw={600}>{fmt(entry.amount, inv.currency)}</Text>
                    <ActionIcon
                      size="xs" variant="subtle" color="red"
                      onClick={() => deleteEntry.mutate({ id: entry.id, investmentId: inv.id })}
                    >
                      <Trash2 size={10} />
                    </ActionIcon>
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>

      <Modal opened={entryModal} onClose={closeEntry} title="Add Contribution" centered>
        <Stack gap="sm">
          <NumberInput
            label={`Amount (${inv.currency})`}
            min={0}
            decimalScale={2}
            value={entryForm.amount}
            onChange={(v) => setEntryForm((f) => ({ ...f, amount: typeof v === 'number' ? v : undefined }))}
            leftSection={<Text size="xs" c="dimmed" fw={600}>{inv.currency}</Text>}
          />
          <TextInput
            label="Date"
            type="date"
            value={entryForm.date}
            onChange={(e) => setEntryForm((f) => ({ ...f, date: e.target.value }))}
          />
          <TextInput
            label="Notes"
            placeholder="Optional"
            value={entryForm.notes ?? ''}
            onChange={(e) => setEntryForm((f) => ({ ...f, notes: e.target.value || undefined }))}
          />
          <Button
            onClick={handleCreateEntry}
            loading={createEntry.isPending}
            disabled={!entryForm.amount}
            style={{ backgroundColor: '#0052CC' }}
          >
            Add Contribution
          </Button>
        </Stack>
      </Modal>
    </Card>
  );
}

export function InvestmentsView() {
  const [opened, { open, close }] = useDisclosure();
  const { data: investments = [], isLoading } = useFinanceInvestments();
  const createInvestment = useCreateInvestment();
  const deleteInvestment = useDeleteInvestment();

  const [form, setForm] = useState<Partial<CreateInvestmentDto>>({ type: 'stock', currency: 'USD' });

  const handleCreate = () => {
    if (!form.name || !form.type) return;
    createInvestment.mutate(form as CreateInvestmentDto, { onSuccess: close });
  };

  if (isLoading) return <Center py="xl"><Loader size="sm" color="#4686FE" /></Center>;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text fw={600} size="sm" c="dimmed">Investments</Text>
        <Button size="xs" leftSection={<Plus size={14} />} onClick={open} style={{ backgroundColor: '#0052CC' }}>
          Add Investment
        </Button>
      </Group>

      {investments.length === 0 ? (
        <Center py="xl"><Text c="dimmed" size="sm">No investments yet.</Text></Center>
      ) : (
        <Stack gap="sm">
          {(investments as FinanceInvestment[]).map((inv) => (
            <InvestmentCard
              key={inv.id}
              inv={inv}
              onDelete={() => deleteInvestment.mutate(inv.id)}
            />
          ))}
        </Stack>
      )}

      <Modal opened={opened} onClose={close} title="New Investment" centered>
        <Stack gap="sm">
          <TextInput
            label="Name"
            placeholder="e.g. Apple Stock"
            value={form.name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Select
            label="Type"
            data={Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            value={form.type}
            onChange={(v) => setForm((f) => ({ ...f, type: v as any }))}
          />
          <TextInput
            label="Ticker (optional)"
            placeholder="e.g. AAPL"
            value={form.ticker ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value || undefined }))}
          />
          <Select
            label="Currency"
            data={[
              { value: 'USD', label: 'USD — Dollar' },
              { value: 'BRL', label: 'BRL — Real' },
              { value: 'EUR', label: 'EUR — Euro' },
              { value: 'GBP', label: 'GBP — Pound' },
              { value: 'JPY', label: 'JPY — Yen' },
              { value: 'ARS', label: 'ARS — Peso' },
            ]}
            value={form.currency}
            onChange={(v) => setForm((f) => ({ ...f, currency: v ?? 'USD' }))}
          />
          <TextInput
            label="Notes (optional)"
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || undefined }))}
          />
          <Button
            onClick={handleCreate}
            loading={createInvestment.isPending}
            disabled={!form.name}
            style={{ backgroundColor: '#0052CC' }}
          >
            Create Investment
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
