'use client';

import { Box, Group, Tooltip, UnstyledButton } from '@mantine/core';
import { HabitLog } from '@/lib/api/services/habits';

interface StreakVisualizerProps {
  habitId: string;
  category: 'good' | 'bad';
  logs: HabitLog[];
  onDayClick: (date: string) => void;
  compact?: boolean; // Para mostrar inline ou na modal
  habitStartDate?: string; // Data de início do hábito (quando começou a praticar)
  habitCreatedAt?: string; // Data de criação do hábito (fallback)
  habitDueDate?: string; // Data alvo de conclusão do hábito
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = date.toISOString().split('T')[0];
  const todayOnly = today.toISOString().split('T')[0];
  const yesterdayOnly = yesterday.toISOString().split('T')[0];

  if (dateOnly === todayOnly) return 'Today';
  if (dateOnly === yesterdayOnly) return 'Yesterday';

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${weekDays[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
}

export function StreakVisualizer({
  habitId,
  category,
  logs,
  onDayClick,
  compact = true,
  habitStartDate,
  habitCreatedAt,
  habitDueDate,
}: StreakVisualizerProps) {
  const days = getAllDaysSinceStart(logs, habitStartDate, habitCreatedAt, habitDueDate);

  const isCompleted = (date: string): boolean => {
    return logs.some((log) => log.date === date && log.completed);
  };

  const getBoxColor = (date: string): string => {
    const completed = isCompleted(date);
    const today = new Date().toISOString().split('T')[0];
    const isPast = date < today;
    const isToday = date === today;

    if (completed) {
      // Verde para hábitos bons, vermelho para ruins
      return category === 'good' ? '#40C057' : '#FA5252';
    }

    if (isPast) {
      // Cinza escuro para dias passados não completados
      return '#868E96';
    }

    if (isToday) {
      // Cinza claro para hoje (ainda não completado)
      return '#ADB5BD';
    }

    // Futuro - muito claro
    return '#E9ECEF';
  };

  return (
    <Group gap={compact ? 'xs' : 'sm'}>
      {days.map((date, index) => {
        const completed = isCompleted(date);
        const color = getBoxColor(date);
        const dayNumber = index + 1; // Day number (1, 2, 3, ...)

        return (
          <Tooltip
            key={date}
            label={`Day ${dayNumber} - ${formatDateLabel(date)} - ${completed ? 'Completed' : 'Not completed'}`}
            position="top"
            withArrow
          >
            <UnstyledButton
              onClick={() => onDayClick(date)}
              style={{
                width: compact ? 24 : 32,
                height: compact ? 24 : 32,
                backgroundColor: color,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: compact ? '9px' : '11px',
                fontWeight: 600,
                color: completed ? '#fff' : '#868E96',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.borderColor = '#228BE6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {dayNumber}
            </UnstyledButton>
          </Tooltip>
        );
      })}
    </Group>
  );
}

function getAllDaysSinceStart(logs: HabitLog[], habitStartDate?: string, habitCreatedAt?: string, habitDueDate?: string): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start date: prioritize habit start date, fallback to creation date
  let startDate: Date;

  if (habitStartDate) {
    // Use habit start date (when user decided to start practicing)
    startDate = new Date(habitStartDate.split('T')[0] + 'T00:00:00');
  } else if (habitCreatedAt) {
    // Fallback: use habit creation date
    startDate = new Date(habitCreatedAt.split('T')[0] + 'T00:00:00');
  } else {
    // Last resort: use today if no dates available
    startDate = new Date(today);
  }

  // End date: ALWAYS use due date to show the full challenge
  let endDate: Date;

  if (habitDueDate) {
    // Use the due date, even if it's in the future
    endDate = new Date(habitDueDate + 'T00:00:00');
  } else {
    // Default: 21 days from creation
    const default21Days = new Date(startDate);
    default21Days.setDate(default21Days.getDate() + 21);
    endDate = default21Days;
  }

  const allDays: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    allDays.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return allDays;
}
