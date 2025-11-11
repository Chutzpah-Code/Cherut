'use client';

import React from 'react';
import { Modal, Stack, TextInput, Textarea, Button, Group, Divider, Text, Box, ScrollArea, Badge, Grid } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Habit, HabitLog } from '@/lib/api/services/habits';
import { StreakVisualizer } from './StreakVisualizer';
import { Trash2 } from 'lucide-react';

interface HabitModalProps {
  opened: boolean;
  onClose: () => void;
  habit: Habit | null;
  logs: HabitLog[];
  onSave: (habitId: string, updates: { title: string; description?: string; dueDate?: string }) => Promise<void>;
  onDelete: (habitId: string) => void;
  onDayClick: (habitId: string, date: string) => void;
  isSaving: boolean;
}

function calculateStats(logs: HabitLog[]) {
  const completedLogs = logs.filter((log) => log.completed);
  const totalDays = logs.length;
  const completedDays = completedLogs.length;
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // Calcular streak atual
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

  // Calcular melhor streak
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

export function HabitModal({
  opened,
  onClose,
  habit,
  logs,
  onSave,
  onDelete,
  onDayClick,
  isSaving,
}: HabitModalProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [dueDateValue, setDueDateValue] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      if (habit.dueDate) {
        setDueDateValue(new Date(habit.dueDate + 'T00:00:00'));
      } else {
        setDueDateValue(null);
      }
    }
  }, [habit]);

  if (!habit) return null;

  const stats = calculateStats(logs);
  const categoryColor = habit.category === 'good' ? 'green' : 'red';
  const categoryLabel = habit.category === 'good' ? 'Good Habit' : 'Bad Habit';

  // Calculate total days from creation to due date
  const getTotalDays = () => {
    if (!habit.dueDate || !habit.createdAt) return 21; // Default to 21 if no dates

    const start = new Date(habit.createdAt.split('T')[0]);
    const end = new Date(habit.dueDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

    return diffDays;
  };

  const totalDays = getTotalDays();

  const handleSave = async () => {
    await onSave(habit.id, {
      title,
      description,
      dueDate: dueDateValue ? dueDateValue.toISOString().split('T')[0] : undefined,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Text fw={600} size="lg">
            Edit Habit
          </Text>
          <Badge color={categoryColor} variant="light">
            {categoryLabel}
          </Badge>
        </Group>
      }
      size={{ base: 'full', xs: 'lg', sm: 'xl' }}
      fullScreen={{ base: true, xs: false }}
      styles={(theme) => ({
        content: {
          maxHeight: { base: '100vh', xs: 'calc(100vh - 120px)' },
        },
        body: {
          padding: { base: theme.spacing.xs, xs: theme.spacing.md },
          maxHeight: { base: 'calc(100vh - 60px)', xs: 'calc(100vh - 120px)' },
          overflowY: 'auto',
        },
        header: {
          padding: { base: theme.spacing.xs, xs: theme.spacing.md },
          borderBottom: `1px solid ${theme.colors.gray[2]}`,
        },
        title: {
          fontSize: { base: theme.fontSizes.md, xs: theme.fontSizes.lg },
          fontWeight: 600,
        },
      })}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="md">
        {/* Form */}
        <TextInput
          label="Title"
          placeholder="Habit name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Describe your habit..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <DateInput
          label="Due Date"
          description="Target completion date for this habit"
          placeholder="Select date"
          value={dueDateValue}
          onChange={setDueDateValue}
          minDate={new Date()}
          clearable
        />

        <Divider label="Statistics" labelPosition="center" />

        {/* Progress Bar */}
        {stats.currentStreak < totalDays && (
          <Box p="sm" style={{ backgroundColor: 'var(--mantine-color-blue-0)', borderRadius: 8 }}>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={600}>Habit Challenge Progress</Text>
              <Text size="sm" fw={700} c="blue">{stats.currentStreak}/{totalDays} days</Text>
            </Group>
            <Box style={{ width: '100%', height: 8, backgroundColor: 'var(--mantine-color-gray-2)', borderRadius: 4, overflow: 'hidden' }}>
              <Box
                style={{
                  width: `${(stats.currentStreak / totalDays) * 100}%`,
                  height: '100%',
                  backgroundColor: categoryColor === 'green' ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)',
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
            <Text size="xs" c="dimmed" mt="xs">
              {totalDays - stats.currentStreak} days until goal completion!
            </Text>
          </Box>
        )}

        {stats.currentStreak >= totalDays && (
          <Box p="sm" style={{ backgroundColor: 'var(--mantine-color-green-0)', borderRadius: 8 }}>
            <Group>
              <Text size="lg">🎉</Text>
              <Box style={{ flex: 1 }}>
                <Text size="sm" fw={600} c="green">Goal Completed!</Text>
                <Text size="xs" c="dimmed">You&apos;ve reached your target! Keep it up!</Text>
              </Box>
            </Group>
          </Box>
        )}

        {/* Stats */}
        <Grid grow>
          <Grid.Col span={{ base: 4, sm: 4 }}>
            <Box ta="center">
              <Text size="xl" fw={700} c={categoryColor}>
                {stats.currentStreak}
              </Text>
              <Text size="xs" c="dimmed">
                Current Streak
              </Text>
            </Box>
          </Grid.Col>
          <Grid.Col span={{ base: 4, sm: 4 }}>
            <Box ta="center">
              <Text size="xl" fw={700} c="blue">
                {stats.bestStreak}
              </Text>
              <Text size="xs" c="dimmed">
                Best Streak
              </Text>
            </Box>
          </Grid.Col>
          <Grid.Col span={{ base: 4, sm: 4 }}>
            <Box ta="center">
              <Text size="xl" fw={700} c="grape">
                {stats.completionRate}%
              </Text>
              <Text size="xs" c="dimmed">
                Completion Rate
              </Text>
            </Box>
          </Grid.Col>
        </Grid>

        <Divider label="Complete History" labelPosition="center" />

        {/* Streak completa */}
        <ScrollArea h={200} type="auto">
          <Box p="xs">
            <StreakVisualizer
              habitId={habit.id}
              category={habit.category}
              logs={logs}
              onDayClick={(date) => onDayClick(habit.id, date)}
              compact={false}
              habitCreatedAt={habit.createdAt}
              habitDueDate={habit.dueDate}
            />
          </Box>
        </ScrollArea>

        <Text size="xs" c="dimmed" ta="center">
          Click on the squares to mark/unmark days
        </Text>

        {/* Action buttons */}
        <Stack gap="md" mt="md">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 'content' }}>
              <Button
                variant="light"
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={() => onDelete(habit.id)}
                fullWidth={{ base: true, sm: false }}
              >
                Delete Habit
              </Button>
            </Grid.Col>
          </Grid>

          <Grid justify="flex-end">
            <Grid.Col span={{ base: 6, sm: 'content' }}>
              <Button
                variant="light"
                onClick={onClose}
                fullWidth={{ base: true, sm: false }}
              >
                Cancel
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 'content' }}>
              <Button
                onClick={handleSave}
                loading={isSaving}
                color={categoryColor}
                fullWidth={{ base: true, sm: false }}
              >
                Save Changes
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </Stack>
    </Modal>
  );
}
