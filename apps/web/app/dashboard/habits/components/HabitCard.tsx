'use client';

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
    <Card shadow="sm" padding="md" withBorder>
      <Stack gap="md">
        {/* Header: Title, Badge, and Edit Button */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="sm" wrap="wrap">
              <Text fw={600} size="lg">
                {habit.title}
              </Text>
              {currentStreak > 0 && (
                <Badge
                  size="lg"
                  variant="light"
                  color={habit.category === 'good' ? 'green' : 'red'}
                  leftSection={<Flame size={14} />}
                >
                  {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                </Badge>
              )}
            </Group>

            {habit.description && (
              <Text size="sm" c="dimmed" lineClamp={2} mt="xs">
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
            habitCreatedAt={habit.createdAt}
            habitDueDate={habit.dueDate}
          />
        </ScrollArea>
      </Stack>
    </Card>
  );
}
