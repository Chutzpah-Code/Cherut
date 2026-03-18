'use client';

import React from 'react';
import { Card, Group, Stack, Text, ActionIcon, Badge, Box, ScrollArea } from '@mantine/core';
import { Edit2, Flame } from 'lucide-react';
import { Habit, HabitLog } from '@/lib/api/services/habits';
import { StreakVisualizer } from './StreakVisualizer';

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  onEdit: (habit: Habit) => void;
  onDayClick: (habitId: string, date: string) => void;
}

function calculateCurrentStreak(logs: HabitLog[]): number {
  if (logs.length === 0) return 0;

  const sortedLogs = logs
    .filter((log) => log.completed)
    .map((log) => log.date)
    .sort()
    .reverse();

  if (sortedLogs.length === 0) return 0;

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let currentDate = new Date(today);

  for (const logDate of sortedLogs) {
    const expectedDate = currentDate.toISOString().split('T')[0];

    if (logDate === expectedDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (logDate < expectedDate) {
      // Gap encontrado
      break;
    }
  }

  return streak;
}

export function HabitCard({ habit, logs, onEdit, onDayClick }: HabitCardProps) {
  const currentStreak = calculateCurrentStreak(logs);

  return (
    <React.Fragment>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Card
        shadow="sm"
        padding="md"
        withBorder
        radius={12}
        styles={{
          root: {
            border: '1px solid #E2E8F0',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#4686FE',
              boxShadow: '0 4px 12px rgba(70, 134, 254, 0.15)',
            },
          },
        }}
      >
      <Stack gap="md">
        {/* Header: Title, Badge, and Edit Button */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="sm" wrap="wrap">
              <Text
                fw={600}
                size="lg"
                style={{
                  fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#000000',
                }}
              >
                {habit.title}
              </Text>
              {currentStreak > 0 && (
                <Badge
                  size="lg"
                  variant="light"
                  color={habit.category === 'good' ? 'green' : 'red'}
                  leftSection={<Flame size={14} />}
                  radius={8}
                  styles={{
                    root: {
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: habit.category === 'good' ? '#DCFCE7' : '#FEE2E2',
                      color: habit.category === 'good' ? '#22C55E' : '#EF4444',
                      border: `1px solid ${habit.category === 'good' ? '#22C55E' : '#EF4444'}`,
                    },
                  }}
                >
                  {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                </Badge>
              )}
            </Group>

            {habit.description && (
              <Text
                size="sm"
                c="dimmed"
                lineClamp={2}
                mt="xs"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#666666',
                }}
              >
                {habit.description}
              </Text>
            )}
          </Box>

          {/* Edit button - always visible on top right */}
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={() => onEdit(habit)}
            style={{ flexShrink: 0 }}
            styles={{
              root: {
                color: '#666666',
                '&:hover': {
                  backgroundColor: '#F1F5F9',
                  color: '#4686FE',
                },
              },
            }}
          >
            <Edit2 size={20} />
          </ActionIcon>
        </Group>

        {/* Streak visualizer - full width with scroll */}
        <ScrollArea type="auto" scrollbarSize={6}>
          <StreakVisualizer
            habitId={habit.id}
            category={habit.category}
            logs={logs}
            onDayClick={(date) => onDayClick(habit.id, date)}
            compact={true}
            habitStartDate={habit.startDate}
            habitCreatedAt={habit.createdAt}
            habitDueDate={habit.dueDate}
          />
        </ScrollArea>
      </Stack>
      </Card>
    </React.Fragment>
  );
}
