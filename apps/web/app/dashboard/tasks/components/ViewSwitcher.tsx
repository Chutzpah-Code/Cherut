'use client';

import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { LayoutGrid, Calendar as CalendarIcon, Clock } from 'lucide-react';

export type TaskView = 'kanban' | 'calendar' | 'timetracker';

interface ViewSwitcherProps {
  currentView: TaskView;
  onViewChange: (view: TaskView) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <Group
      gap="xs"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--mantine-color-body)',
        padding: '8px 12px',
        borderRadius: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        border: '1px solid var(--mantine-color-default-border)',
        zIndex: 1000,
      }}
    >
      <Tooltip label="Kanban View">
        <ActionIcon
          size="lg"
          variant={currentView === 'kanban' ? 'filled' : 'subtle'}
          onClick={() => onViewChange('kanban')}
        >
          <LayoutGrid size={20} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Calendar View (Coming Soon)">
        <ActionIcon
          size="lg"
          variant={currentView === 'calendar' ? 'filled' : 'subtle'}
          onClick={() => onViewChange('calendar')}
          disabled
        >
          <CalendarIcon size={20} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Time Tracker View (Coming Soon)">
        <ActionIcon
          size="lg"
          variant={currentView === 'timetracker' ? 'filled' : 'subtle'}
          onClick={() => onViewChange('timetracker')}
          disabled
        >
          <Clock size={20} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
