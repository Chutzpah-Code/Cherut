'use client';

import { Group, Box, Text, Badge, ActionIcon } from '@mantine/core';
import { ArrowUpCircle, ArrowDownCircle, Pencil, Trash2 } from 'lucide-react';
import { FinanceTransaction } from '@/lib/api/services/finance';

function fmt(value: number, currency?: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD' }).format(value);
  } catch {
    return `${currency ?? ''} ${value.toFixed(2)}`;
  }
}

// Extracted from the pre-redesign page.tsx for continuity — reused by Block 3's
// day-grouped transaction list.
export function TransactionRow({ tx, currency, categoryName, accountName, onDelete, onEdit }: {
  tx: FinanceTransaction; currency?: string; categoryName?: string; accountName?: string;
  onDelete?: () => void; onEdit?: () => void;
}) {
  const isIncome = tx.type === 'income';
  const isOrphaned = !!tx.accountId && !accountName;
  return (
    <Group justify="space-between" p="sm" wrap="nowrap" style={{ borderRadius: 8, background: isOrphaned ? '#fff8f0' : '#f8fafc', border: `1px solid ${isOrphaned ? '#fed7aa' : '#E2E8F0'}` }}>
      <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
        {isIncome
          ? <ArrowUpCircle size={18} style={{ color: '#2e7d32', flexShrink: 0 }} />
          : <ArrowDownCircle size={18} style={{ color: '#c62828', flexShrink: 0 }} />}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tx.description || categoryName || tx.type}
          </Text>
          <Group gap={4} wrap="nowrap">
            {isOrphaned && (
              <Badge size="xs" variant="light" color="orange" style={{ textTransform: 'none', flexShrink: 0 }}>
                Deleted account
              </Badge>
            )}
            <Text size="xs" c="dimmed" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {categoryName ? `${categoryName} · ` : 'Uncategorized · '}{tx.date}
            </Text>
          </Group>
        </Box>
      </Group>
      <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
        <Text fw={600} size="sm" style={{ color: isIncome ? '#2e7d32' : '#c62828', whiteSpace: 'nowrap' }}>
          {isIncome ? '+' : '-'}{fmt(tx.amount, currency)}
        </Text>
        {onEdit && (
          <ActionIcon size="md" variant="subtle" color="blue" onClick={onEdit}>
            <Pencil size={14} />
          </ActionIcon>
        )}
        {onDelete && (
          <ActionIcon size="md" variant="subtle" color="red" onClick={onDelete}>
            <Trash2 size={14} />
          </ActionIcon>
        )}
      </Group>
    </Group>
  );
}
