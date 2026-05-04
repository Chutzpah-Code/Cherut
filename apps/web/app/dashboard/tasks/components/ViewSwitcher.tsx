'use client';

import { Group, Text, UnstyledButton, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { LayoutGrid, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';

export type TaskView = 'kanban' | 'calendar' | 'timetracker';

interface ViewSwitcherProps {
  currentView: TaskView;
  onViewChange: (view: TaskView) => void;
}

const VIEWS = [
  { id: 'kanban' as TaskView, label: 'Board', icon: LayoutGrid, comingSoon: false },
  { id: 'calendar' as TaskView, label: 'Calendar', icon: CalendarIcon, comingSoon: true },
  { id: 'timetracker' as TaskView, label: 'Time', icon: Clock, comingSoon: true },
];

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const { mobileOpened, screenSize, isCompact } = useSidebar();
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (isMobile && mobileOpened) return null;

  // Center relative to the content area, not the full viewport
  // Sidebar: mobile=0, tablet/compact=80px, desktop=260px
  const sidebarWidth = screenSize === 'mobile' ? 0 : isCompact ? 80 : 260;
  const leftOffset = `calc(50% + ${sidebarWidth / 2}px)`;

  return (
    <Group
      gap={2}
      style={{
        position: 'fixed',
        bottom: 28,
        left: leftOffset,
        transform: 'translateX(-50%)',
        backgroundColor: '#ffffff',
        padding: '5px 6px',
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(9,30,66,0.15), 0 0 0 1px rgba(9,30,66,0.08)',
        zIndex: 1000,
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
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
              padding: '6px 12px',
              borderRadius: 8,
              cursor: comingSoon ? 'default' : 'pointer',
              backgroundColor: isActive ? '#0052CC' : 'transparent',
              opacity: comingSoon ? 0.45 : 1,
              transition: 'background-color 0.15s ease',
              userSelect: 'none',
            }}
          >
            <Icon size={15} style={{ color: isActive ? '#ffffff' : '#42526E', flexShrink: 0 }} />
            <Text
              size="xs"
              fw={600}
              style={{
                color: isActive ? '#ffffff' : '#42526E',
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
        ) : btn;
      })}
    </Group>
  );
}
