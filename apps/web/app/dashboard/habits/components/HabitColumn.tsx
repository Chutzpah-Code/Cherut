'use client';

import React from 'react';
import { Box, Stack, Title, Button, Group, Alert, ScrollArea } from '@mantine/core';
import { Plus } from 'lucide-react';
import { Habit, HabitLog } from '@/lib/api/services/habits';
import { HabitCard } from './HabitCard';
import { useThemeColors } from '@/hooks/useThemeColors';

interface HabitColumnProps {
  title: string;
  habits: Habit[];
  habitLogs: Record<string, HabitLog[]>;
  onAddHabit: () => void;
  onEdit: (habit: Habit) => void;
  onDayClick: (habitId: string, date: string) => void;
  onUnarchive?: (habit: Habit) => void;
  isArchived?: boolean;
  addButtonText: string;
  emptyStateTitle: string;
  emptyStateMessage: string;
}

export function HabitColumn({
  title,
  habits,
  habitLogs,
  onAddHabit,
  onEdit,
  onDayClick,
  onUnarchive,
  isArchived = false,
  addButtonText,
  emptyStateTitle,
  emptyStateMessage,
}: HabitColumnProps) {
  const colors = useThemeColors();
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '400px',
        height: 'auto',
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 200ms ease',
      }}
    >
      {/* Column Header */}
      <Group justify="space-between" mb="md" style={{ flexShrink: 0, flexWrap: 'wrap', gap: '12px' }}>
        <Title
          order={3}
          style={{
            fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: 700,
            color: colors.text.primary,
          }}
        >
          {title}
        </Title>
        {!isArchived && (
          <Button
            leftSection={<Plus size={18} />}
            onClick={onAddHabit}
            radius={40}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              height: '44px',
              padding: '0 16px',
              background: colors.primary,
              border: 'none',
              color: 'white',
              boxShadow: 'rgba(0,0,0,0.15) 0px 4px 8px 0px',
              minWidth: '44px',
            }}
            styles={{
              root: {
                '&:hover': {
                  opacity: 0.9,
                  transform: 'translateY(-1px)',
                },
              },
            }}
          >
            {addButtonText}
          </Button>
        )}
      </Group>

      {/* Scrollable Content */}
      <ScrollArea
        style={{ flex: 1, marginRight: '-16px', paddingRight: '16px' }}
        type="auto"
        scrollbarSize={6}
        styles={{
          scrollbar: {
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
            },
          },
          thumb: {
            backgroundColor: colors.border,
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: colors.primary,
            },
          },
        }}
      >
        {habits.length === 0 ? (
          <Alert
            variant="light"
            color="gray"
            title={emptyStateTitle}
            radius={12}
            styles={{
              root: {
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
              },
              title: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.text.primary,
              },
              message: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: colors.text.secondary,
              },
            }}
          >
            {emptyStateMessage}
          </Alert>
        ) : (
          <Stack gap="md">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                logs={habitLogs[habit.id] || []}
                onEdit={onEdit}
                onDayClick={onDayClick}
                isArchived={isArchived}
                onUnarchive={onUnarchive}
              />
            ))}
          </Stack>
        )}
      </ScrollArea>
    </Box>
  );
}