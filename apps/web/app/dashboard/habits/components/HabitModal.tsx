'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Modal, Stack, TextInput, Textarea, Button, Group, Divider, Text, Box, ScrollArea, Badge, Grid } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Habit, HabitLog } from '@/lib/api/services/habits';
import { StreakVisualizer } from './StreakVisualizer';
import { Trash2, Archive, ArchiveRestore } from 'lucide-react';

interface HabitModalProps {
  opened: boolean;
  onClose: () => void;
  habit: Habit | null;
  logs: HabitLog[];
  onSave: (habitId: string, updates: { title: string; description?: string; startDate?: string; dueDate?: string }) => Promise<void>;
  onDelete: (habitId: string) => void;
  onArchive: (habitId: string) => void;
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
  onArchive,
  onDayClick,
  isSaving,
}: HabitModalProps) {
  const t = useTranslations('habits.modal');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [startDateValue, setStartDateValue] = React.useState<Date | null>(null);
  const [dueDateValue, setDueDateValue] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      if (habit.startDate) {
        setStartDateValue(new Date(habit.startDate + 'T00:00:00'));
      } else {
        setStartDateValue(null);
      }
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
  const categoryLabel = habit.category === 'good' ? t('goodHabit') : t('badHabit');

  // Calculate total days from start date to due date
  const getTotalDays = () => {
    if (!habit.dueDate) return 21; // Default to 21 if no due date

    // Use startDate if available, otherwise fall back to createdAt
    const startDate = habit.startDate || habit.createdAt;
    if (!startDate) return 21;

    const start = new Date(startDate.split('T')[0]);
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
      startDate: startDateValue ? startDateValue.toISOString().split('T')[0] : undefined,
      dueDate: dueDateValue ? dueDateValue.toISOString().split('T')[0] : undefined,
    });
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group gap="sm">
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '26px',
                fontWeight: 500,
                letterSpacing: '-0.78px',
                color: '#000000',
              }}
            >
              {t('editHabit')}
            </Text>
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
              {categoryLabel}
            </Badge>
          </Group>
        }
        size="lg"
        fullScreen
        radius={16}
        styles={{
          content: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            height: '100dvh',
            maxHeight: '100dvh',
            overflow: 'hidden',
          },
          body: {
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
          },
          header: {
            padding: '24px 32px 0 32px',
            borderBottom: 'none',
          },
        }}
        overlayProps={{
          backgroundOpacity: 0.6,
          blur: 4,
        }}
      >
      <Box px="xl" py="md" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        <Stack gap="md">
          {/* Form */}
          <TextInput
            label={t('titleLabel')}
            placeholder={t('titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            label={t('description')}
            placeholder={t('descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <Grid grow>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label={t('startDate')}
                description={t('startDateDesc')}
                placeholder={t('startDatePlaceholder')}
                value={startDateValue}
                onChange={setStartDateValue}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label={t('dueDate')}
                description={t('dueDateDesc')}
                placeholder={t('dueDatePlaceholder')}
                value={dueDateValue}
                onChange={setDueDateValue}
                minDate={startDateValue || new Date()}
                clearable
              />
            </Grid.Col>
          </Grid>

          <Divider label={t('statistics')} labelPosition="center" />

          {/* Progress Bar */}
          {stats.currentStreak < totalDays && (
            <Box p="sm" style={{ backgroundColor: 'var(--mantine-color-blue-0)', borderRadius: 8 }}>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={600}>{t('challengeProgress')}</Text>
                <Text size="sm" fw={700} c="blue">{t('daysProgress', { done: stats.currentStreak, total: totalDays })}</Text>
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
                {t('daysUntilGoal', { count: totalDays - stats.currentStreak })}
              </Text>
            </Box>
          )}

          {stats.currentStreak >= totalDays && (
            <Box p="sm" style={{ backgroundColor: 'var(--mantine-color-green-0)', borderRadius: 8 }}>
              <Group>
                <Text size="lg">🎉</Text>
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={600} c="green">{t('goalCompleted')}</Text>
                  <Text size="xs" c="dimmed">{t('goalCompletedMsg')}</Text>
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
                  {t('currentStreak')}
                </Text>
              </Box>
            </Grid.Col>
            <Grid.Col span={{ base: 4, sm: 4 }}>
              <Box ta="center">
                <Text size="xl" fw={700} c="blue">
                  {stats.bestStreak}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('bestStreak')}
                </Text>
              </Box>
            </Grid.Col>
            <Grid.Col span={{ base: 4, sm: 4 }}>
              <Box ta="center">
                <Text size="xl" fw={700} c="grape">
                  {stats.completionRate}%
                </Text>
                <Text size="xs" c="dimmed">
                  {t('completionRate')}
                </Text>
              </Box>
            </Grid.Col>
          </Grid>

          <Divider label={t('completeHistory')} labelPosition="center" />

          {/* Streak completa */}
          <ScrollArea h={200} type="auto">
            <Box p="xs">
              <StreakVisualizer
                habitId={habit.id}
                category={habit.category}
                logs={logs}
                onDayClick={(date) => onDayClick(habit.id, date)}
                compact={false}
                habitStartDate={habit.startDate}
                habitCreatedAt={habit.createdAt}
                habitDueDate={habit.dueDate}
              />
            </Box>
          </ScrollArea>

          <Text size="xs" c="dimmed" ta="center">
            {t('clickToToggle')}
          </Text>
        </Stack>
      </Box>
      <Box px="md" py="sm" style={{ borderTop: '1px solid #E2E8F0', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Button
                variant="outline"
                leftSection={habit.isActive === false ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                onClick={() => onArchive(habit.id)}
                fullWidth
                radius={8}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  borderColor: '#4686FE',
                  color: '#4686FE',
                  fontSize: '14px',
                  fontWeight: 600,
                  height: '40px',
                  background: 'white',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      backgroundColor: '#EBF8FF',
                    },
                  },
                }}
              >
                {habit.isActive === false ? t('restoreHabit') : t('archiveHabit')}
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Button
                variant="outline"
                leftSection={<Trash2 size={16} />}
                onClick={() => onDelete(habit.id)}
                fullWidth
                radius={8}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  borderColor: '#EF4444',
                  color: '#EF4444',
                  fontSize: '14px',
                  fontWeight: 600,
                  height: '40px',
                  background: 'white',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      backgroundColor: '#FEF2F2',
                    },
                  },
                }}
              >
                {t('deleteHabit')}
              </Button>
            </Grid.Col>
          </Grid>

          <Grid justify="flex-end">
            <Grid.Col span={{ base: 6, sm: 'content' }}>
              <Button
                onClick={onClose}
                fullWidth
                radius={40}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  background: '#4686FE',
                  color: 'white',
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: 500,
                  height: '48px',
                  border: 'none',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      background: '#3366E5',
                      opacity: 0.9,
                    },
                  },
                }}
              >
                {t('cancel')}
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 'content' }}>
              <Button
                onClick={handleSave}
                loading={isSaving}
                fullWidth
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
                {t('saveChanges')}
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
      </Modal>
    </>
  );
}
