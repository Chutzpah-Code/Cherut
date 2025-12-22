'use client';

import { Group, Button, Text, Badge } from '@mantine/core';
import { Archive, Eye, EyeOff } from 'lucide-react';
import { HabitCounts } from '@/lib/api/services/habits';

export type HabitsFilterType = 'active' | 'archived' | 'all';

interface HabitsFilterProps {
  currentFilter: HabitsFilterType;
  onFilterChange: (filter: HabitsFilterType) => void;
  habitCounts?: HabitCounts;
}

export function HabitsFilter({ currentFilter, onFilterChange, habitCounts }: HabitsFilterProps) {
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

      {habitCounts && (
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            {currentFilter === 'active' && `${habitCounts.active} active habits`}
            {currentFilter === 'archived' && `${habitCounts.archived} archived habits`}
            {currentFilter === 'all' && `${habitCounts.total} total habits`}
          </Text>

          {currentFilter === 'archived' && habitCounts.archived > 0 && (
            <Badge size="sm" color="gray" variant="light">
              {habitCounts.archived}
            </Badge>
          )}
        </Group>
      )}
    </Group>
  );
}