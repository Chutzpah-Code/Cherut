'use client';

import React from 'react';
import { Box, Group, Text, Progress } from '@mantine/core';
import { HabitLog } from '@/lib/api/services/habits';

interface HabitSummaryProps {
  logs: HabitLog[];
  habitStartDate?: string;
  habitCreatedAt?: string;
  habitDueDate?: string;
}

function calculateStats(logs: HabitLog[], habitStartDate?: string, habitCreatedAt?: string, habitDueDate?: string) {
  const completedLogs = logs.filter((log) => log.completed);

  // Calculate total days based on habit duration
  const getTotalDays = () => {
    if (!habitDueDate) return 21; // Default to 21 if no due date

    // Use startDate if available, otherwise fall back to createdAt
    const startDate = habitStartDate || habitCreatedAt;
    if (!startDate) return 21;

    const start = new Date(startDate.split('T')[0]);
    const end = new Date(habitDueDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

    return diffDays;
  };

  const totalDays = getTotalDays();
  const completedDays = completedLogs.length;
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  let currentDate = new Date(today);

  const sortedLogs = completedLogs
    .map((log) => log.date)
    .sort()
    .reverse();

  for (const logDate of sortedLogs) {
    const expectedDate = currentDate.toISOString().split('T')[0];
    if (logDate === expectedDate) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (logDate < expectedDate) {
      break;
    }
  }

  // Calculate best streak
  let bestStreak = 0;
  let tempStreak = 0;
  let lastDate: string | null = null;

  sortedLogs.reverse().forEach((date) => {
    if (!lastDate) {
      tempStreak = 1;
    } else {
      const last = new Date(lastDate);
      const current = new Date(date);
      const diffDays = Math.round((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    lastDate = date;
  });
  bestStreak = Math.max(bestStreak, tempStreak);

  return { currentStreak, bestStreak, completionRate, completedDays, totalDays };
}

export function HabitSummary({ logs, habitStartDate, habitCreatedAt, habitDueDate }: HabitSummaryProps) {
  const stats = calculateStats(logs, habitStartDate, habitCreatedAt, habitDueDate);

  return (
    <Box>
      {/* Progress Bar */}
      <Box mb="xs">
        <Progress
          value={stats.completionRate}
          size="sm"
          radius={8}
          color="#4686FE"
          style={{
            backgroundColor: '#EEEEEE',
          }}
        />
      </Box>

      {/* Statistics */}
      <Group justify="space-between" align="center">
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            color: '#666666',
          }}
        >
          {stats.completedDays}/{stats.totalDays} days ({stats.completionRate}%)
        </Text>
        {stats.bestStreak > 0 && (
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: '#666666',
            }}
          >
            Best: {stats.bestStreak} {stats.bestStreak === 1 ? 'day' : 'days'}
          </Text>
        )}
      </Group>
    </Box>
  );
}