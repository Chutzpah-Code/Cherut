'use client';

import React from 'react';
import { Group, Button, Text, Badge } from '@mantine/core';
import { Archive, Eye, EyeOff } from 'lucide-react';
import { JournalCounts } from '@/lib/api/services/journal';

export type JournalFilterType = 'active' | 'archived' | 'all';

interface JournalFilterProps {
  currentFilter: JournalFilterType;
  onFilterChange: (filter: JournalFilterType) => void;
  journalCounts?: JournalCounts;
}

export function JournalFilter({
  currentFilter,
  onFilterChange,
  journalCounts,
}: JournalFilterProps) {
  return (
    <Group justify="space-between" align="center" mb="md">
      <Group gap="sm">
        <Button
          variant={currentFilter === 'active' ? 'filled' : 'light'}
          size="sm"
          onClick={() => onFilterChange('active')}
          leftSection={<Eye size={16} />}
        >
          Active
        </Button>
        <Button
          variant={currentFilter === 'archived' ? 'filled' : 'light'}
          size="sm"
          onClick={() => onFilterChange('archived')}
          leftSection={<Archive size={16} />}
        >
          Archived
        </Button>
        <Button
          variant={currentFilter === 'all' ? 'filled' : 'light'}
          size="sm"
          onClick={() => onFilterChange('all')}
          leftSection={<EyeOff size={16} />}
        >
          All
        </Button>
      </Group>

      {journalCounts && (
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            {currentFilter === 'active' && `${journalCounts.active} active entries`}
            {currentFilter === 'archived' && `${journalCounts.archived} archived entries`}
            {currentFilter === 'all' && `${journalCounts.total} total entries`}
          </Text>

          {currentFilter === 'archived' && journalCounts.archived > 0 && (
            <Badge size="sm" color="gray" variant="light">
              {journalCounts.archived}
            </Badge>
          )}
        </Group>
      )}
    </Group>
  );
}