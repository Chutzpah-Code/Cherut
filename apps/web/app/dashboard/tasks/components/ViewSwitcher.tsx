'use client';

import { Box, Group, Text, UnstyledButton, Tooltip } from '@mantine/core';
import { LayoutGrid, Calendar as CalendarIcon, Clock } from 'lucide-react';

export type TaskView = 'kanban' | 'calendar' | 'timetracker';

interface ViewSwitcherProps {
  currentView: TaskView;
  onViewChange: (view: TaskView) => void;
}

const VIEWS = [
  { id: 'kanban' as TaskView, label: 'Board', icon: LayoutGrid, comingSoon: false },
  { id: 'calendar' as TaskView, label: 'Calendar', icon: CalendarIcon, comingSoon: false },
  { id: 'timetracker' as TaskView, label: 'Time', icon: Clock, comingSoon: false },
];

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <Box
      style={{
        marginLeft: 'calc(-1 * var(--mantine-spacing-md))',
        marginRight: 'calc(-1 * var(--mantine-spacing-md))',
        paddingLeft: 'var(--mantine-spacing-md)',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: 16,
        backgroundColor: '#ffffff',
      }}
    >
      <Group gap={0}>
        {VIEWS.map(({ id, label, icon: Icon, comingSoon }) => {
          const isActive = currentView === id;

          const btn = (
            <UnstyledButton
              key={id}
              onClick={() => !comingSoon && onViewChange(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                marginBottom: -1,
                borderBottom: isActive ? '2px solid #0052CC' : '2px solid transparent',
                cursor: comingSoon ? 'default' : 'pointer',
                opacity: comingSoon ? 0.45 : 1,
                transition: 'border-color 0.15s ease, color 0.15s ease',
                userSelect: 'none',
              }}
            >
              <Icon
                size={15}
                style={{ color: isActive ? '#0052CC' : '#42526E', flexShrink: 0 }}
              />
              <Text
                size="sm"
                fw={isActive ? 600 : 500}
                style={{
                  color: isActive ? '#0052CC' : '#42526E',
                  letterSpacing: '-0.01em',
                  lineHeight: 1,
                }}
              >
                {label}
              </Text>
            </UnstyledButton>
          );

          return comingSoon ? (
            <Tooltip key={id} label="Coming soon" position="top" withArrow>
              <span>{btn}</span>
            </Tooltip>
          ) : (
            btn
          );
        })}
      </Group>
    </Box>
  );
}
