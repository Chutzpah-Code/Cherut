'use client';

import { Group, Button, Text, Badge } from '@mantine/core';
import { Archive, Eye, EyeOff } from 'lucide-react';

export type TaskFilter = 'active' | 'archived' | 'all';

interface TaskFilterProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  taskCounts?: {
    active: number;
    archived: number;
    total: number;
  };
}

export function TaskFilter({ currentFilter, onFilterChange, taskCounts }: TaskFilterProps) {
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

      {taskCounts && (
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            {currentFilter === 'active' && `${taskCounts.active} active tasks`}
            {currentFilter === 'archived' && `${taskCounts.archived} archived tasks`}
            {currentFilter === 'all' && `${taskCounts.total} total tasks`}
          </Text>

          {currentFilter === 'archived' && taskCounts.archived > 0 && (
            <Badge size="sm" color="gray" variant="light">
              {taskCounts.archived}
            </Badge>
          )}
        </Group>
      )}
    </Group>
  );
}