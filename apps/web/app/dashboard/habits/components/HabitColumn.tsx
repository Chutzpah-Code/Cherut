'use client';

import React from 'react';
import { Box, Stack, Title, Button, Group, Alert, ScrollArea } from '@mantine/core';
import { Plus } from 'lucide-react';
import { Habit, HabitLog } from '@/lib/api/services/habits';
import { HabitCard } from './HabitCard';

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
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '548px', // Optimized to show 3.5 habits (desktop)
        background: '#FBFBFB',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: '24px',
        padding: '24px',
      }}
      styles={{
        root: {
          '@media (max-width: 768px)': {
            height: '450px', // Smaller height for mobile/tablet
          },
          '@media (max-width: 480px)': {
            height: '400px', // Even smaller for mobile
            padding: '16px',
          },
        },
      }}
    >
      {/* Column Header */}
      <Group justify="space-between" mb="md" style={{ flexShrink: 0 }}>
        <Title
          order={3}
          style={{
            fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            color: '#000000',
          }}
        >
          {title}
        </Title>
        {!isArchived && (
          <Button
            leftSection={<Plus size={20} />}
            onClick={onAddHabit}
            radius={40}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              height: '48px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #659BFF 0%, #4686FE 100%)',
              border: 'none',
              color: 'white',
              boxShadow: 'rgba(0,0,0,0.15) 0px 4px 8px 0px',
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
            backgroundColor: '#CCCCCC',
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: '#4686FE',
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
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
              },
              title: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                color: '#334155',
              },
              message: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#64748B',
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