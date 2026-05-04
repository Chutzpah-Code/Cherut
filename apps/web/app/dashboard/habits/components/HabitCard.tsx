'use client';

import React from 'react';
import { Card, Group, Stack, Text, ActionIcon, Badge, Box, ScrollArea, Menu } from '@mantine/core';
import { Edit2, Flame, MoreVertical, ArchiveRestore, Eye } from 'lucide-react';
import { Habit, HabitLog } from '@/lib/api/services/habits';
import { HabitSummary } from './HabitSummary';

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  onEdit: (habit: Habit) => void;
  onDayClick: (habitId: string, date: string) => void;
  isArchived?: boolean;
  onUnarchive?: (habit: Habit) => void;
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

export function HabitCard({ habit, logs, onEdit, onDayClick, isArchived = false, onUnarchive }: HabitCardProps) {
  const currentStreak = calculateCurrentStreak(logs);

  return (
    <React.Fragment>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Card
        padding={24}
        withBorder
        radius={16}
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          transition: 'all 0.2s ease',
        }}
        styles={{
          root: {
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
                style={{
                  fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#000000',
                }}
              >
                {habit.title}
              </Text>
              {isArchived && (
                <Badge
                  radius={40}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: '#4686FE',
                    color: 'white',
                    padding: '4px 8px',
                    border: 'none',
                  }}
                >
                  Archived
                </Badge>
              )}
              {currentStreak > 0 && (
                <Badge
                  leftSection={<Flame size={14} />}
                  radius={40}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: '#FFBE0D',
                    color: '#000',
                    padding: '4px 12px',
                    border: 'none',
                  }}
                >
                  {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                </Badge>
              )}
            </Group>

            {habit.description && (
              <Text
                lineClamp={2}
                mt="xs"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#666666',
                  lineHeight: '20px',
                }}
              >
                {habit.description}
              </Text>
            )}
          </Box>

          {/* Edit button or Menu for archived items */}
          {isArchived ? (
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
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
                  <MoreVertical size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<Eye size={16} />}
                  onClick={() => onEdit(habit)}
                >
                  View Details
                </Menu.Item>
                {onUnarchive && (
                  <Menu.Item
                    leftSection={<ArchiveRestore size={16} />}
                    onClick={() => onUnarchive(habit)}
                  >
                    Unarchive
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          ) : (
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
          )}
        </Group>

        {/* Habit summary - clean progress overview */}
        <HabitSummary
          logs={logs}
          habitStartDate={habit.startDate}
          habitCreatedAt={habit.createdAt}
          habitDueDate={habit.dueDate}
        />
      </Stack>
      </Card>
    </React.Fragment>
  );
}
