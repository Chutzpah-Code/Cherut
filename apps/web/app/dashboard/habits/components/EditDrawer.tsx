'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@mantine/hooks';
import {
  Drawer, Group, Box, Text, ActionIcon, ThemeIcon, Button, TextInput, Textarea, Select,
  Stack, Grid, Divider, Badge, ScrollArea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { X, Flame, Archive, ArchiveRestore, Trash2, Check, Loader2, AlertCircle } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateHabit, useUpdateHabit } from '@/hooks/useHabits';
import { Habit, HabitLog } from '@/lib/api/services/habits';
import { StreakVisualizer } from './StreakVisualizer';

interface LifeAreaOption {
  id: string;
  name: string;
}

interface FormState {
  title: string;
  description: string;
  lifeAreaId: string;
  startDateValue: Date | null;
  dueDateValue: Date | null;
}

function toFormState(habit: Habit | null): FormState {
  if (!habit) {
    const start = new Date();
    const due = new Date();
    due.setDate(due.getDate() + 21);
    return { title: '', description: '', lifeAreaId: '', startDateValue: start, dueDateValue: due };
  }
  return {
    title: habit.title,
    description: habit.description || '',
    lifeAreaId: habit.lifeAreaId || '',
    startDateValue: habit.startDate ? new Date(habit.startDate + 'T00:00:00') : null,
    dueDateValue: habit.dueDate ? new Date(habit.dueDate + 'T00:00:00') : null,
  };
}

function calculateStats(logs: HabitLog[]) {
  const completedLogs = logs.filter((log) => log.completed);
  const totalDays = logs.length;
  const completedDays = completedLogs.length;
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  let currentDate = new Date(today);

  const sortedLogs = completedLogs.map((log) => log.date).sort().reverse();

  for (const logDate of sortedLogs) {
    const expectedDate = currentDate.toISOString().split('T')[0];
    if (logDate === expectedDate) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (logDate < expectedDate) {
      break;
    }
  }

  let bestStreak = 0;
  let tempStreak = 0;
  let lastDate: string | null = null;

  sortedLogs.reverse().forEach((date) => {
    if (!lastDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((new Date(date).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) tempStreak++;
      else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    lastDate = date;
  });
  bestStreak = Math.max(bestStreak, tempStreak);

  return { currentStreak, bestStreak, completionRate };
}

interface EditDrawerProps {
  opened: boolean;
  onClose: () => void;
  habit: Habit | null;
  category: 'good' | 'bad';
  logs: HabitLog[];
  lifeAreas: LifeAreaOption[];
  onDelete: (habitId: string) => void;
  onArchive: (habitId: string) => void;
  onDayClick: (habitId: string, date: string) => void;
  onCreated: (habit: Habit) => void;
}

type SaveStatus = 'idle' | 'pending' | 'saved' | 'error';

export function EditDrawer({
  opened, onClose, habit, category, logs, lifeAreas, onDelete, onArchive, onDayClick, onCreated,
}: EditDrawerProps) {
  const t = useTranslations('habits.modal');
  const tp = useTranslations('habits.page');
  const te = useTranslations('habits.editDrawer');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isFullScreen = useMediaQuery('(max-width: 639px)');

  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();

  const mode: 'create' | 'edit' = habit ? 'edit' : 'create';
  const effectiveCategory = habit?.category ?? category;

  const [formState, setFormState] = useState<FormState>(() => toFormState(habit));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showErrors, setShowErrors] = useState(false);

  const mountedRef = useRef(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!opened) return;
    setFormState(toFormState(habit));
    mountedRef.current = false;
    dirtyRef.current = false;
    setSaveStatus('idle');
    setShowErrors(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, habit?.id]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (mode === 'edit') dirtyRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  const debouncedFormState = useDebounce(formState, 500);

  useEffect(() => {
    if (mode !== 'edit' || !habit || !dirtyRef.current) return;
    dirtyRef.current = false;
    setSaveStatus('pending');
    updateMutation.mutate(
      {
        id: habit.id,
        dto: {
          title: debouncedFormState.title,
          description: debouncedFormState.description || undefined,
          lifeAreaId: debouncedFormState.lifeAreaId || undefined,
          startDate: debouncedFormState.startDateValue ? debouncedFormState.startDateValue.toISOString().split('T')[0] : undefined,
          dueDate: debouncedFormState.dueDateValue ? debouncedFormState.dueDateValue.toISOString().split('T')[0] : undefined,
        },
      },
      {
        onSuccess: () => setSaveStatus('saved'),
        onError: () => setSaveStatus('error'),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormState]);

  const requiredFieldsFilled = !!formState.title.trim() && !!formState.lifeAreaId;

  const handleCreate = async () => {
    if (!requiredFieldsFilled) {
      setShowErrors(true);
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        category,
        type: 'boolean',
        frequency: 'daily',
        lifeAreaId: formState.lifeAreaId,
        startDate: formState.startDateValue ? formState.startDateValue.toISOString().split('T')[0] : undefined,
        dueDate: formState.dueDateValue ? formState.dueDateValue.toISOString().split('T')[0] : undefined,
      });
      onCreated(created);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || te('createFailed');
      notifications.show({ title: te('createErrorTitle'), message, color: 'red' });
    }
  };

  const accentColor = effectiveCategory === 'good' ? '#22C55E' : '#EF4444';
  const categoryLabel = effectiveCategory === 'good' ? t('goodHabit') : t('badHabit');

  const getTotalDays = () => {
    if (!habit?.dueDate) return 21;
    const startDate = habit.startDate || habit.createdAt;
    if (!startDate) return 21;
    const start = new Date(startDate.split('T')[0]);
    const end = new Date(habit.dueDate);
    const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const stats = habit ? calculateStats(logs) : null;
  const totalDays = getTotalDays();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isFullScreen ? '100%' : 480}
      withOverlay={!isDesktop}
      closeOnClickOutside={!isDesktop}
      withCloseButton={false}
      padding={0}
      styles={{
        content: {
          maxWidth: '100vw',
          height: isFullScreen ? '100dvh' : undefined,
          display: 'flex',
          flexDirection: 'column',
        },
        body: { padding: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box px="md" py="sm" style={{ borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <ThemeIcon size={40} radius={8} variant="light" color={effectiveCategory === 'good' ? 'green' : 'red'}>
              <Flame size={20} />
            </ThemeIcon>
            <Box style={{ minWidth: 0 }}>
              <Group gap={6} wrap="nowrap">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                  {mode === 'edit' ? te('editLabel') : te('newLabel')}
                </Text>
                <Badge size="xs" radius={40} style={{ backgroundColor: accentColor, color: 'white', border: 'none' }}>
                  {categoryLabel}
                </Badge>
              </Group>
              <Text size="sm" fw={600} truncate>{formState.title || tp('titlePlaceholder')}</Text>
            </Box>
          </Group>
          <ActionIcon size={44} variant="subtle" onClick={onClose} aria-label={te('close')}>
            <X size={20} />
          </ActionIcon>
        </Group>
      </Box>

      <Box px="md" py="md" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Stack gap="md">
          <TextInput
            label={tp('titleLabel')}
            placeholder={tp('titlePlaceholder')}
            value={formState.title}
            onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
            required
            withAsterisk
            error={showErrors && !formState.title.trim() ? te('fieldRequired') : undefined}
            radius={8}
          />

          <Textarea
            label={tp('description')}
            placeholder={tp('descriptionPlaceholder')}
            value={formState.description}
            onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            radius={8}
          />

          <Select
            label={tp('lifeArea')}
            placeholder={tp('selectArea')}
            value={formState.lifeAreaId || null}
            onChange={(value) => setFormState((prev) => ({ ...prev, lifeAreaId: value || '' }))}
            data={lifeAreas.map((area) => ({ value: area.id, label: area.name }))}
            required
            withAsterisk
            error={showErrors && !formState.lifeAreaId ? te('fieldRequired') : undefined}
            radius={8}
          />

          <Grid grow>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label={tp('startDate')}
                description={t('startDateDesc')}
                placeholder={tp('startDatePlaceholder')}
                value={formState.startDateValue}
                onChange={(v) => setFormState((prev) => ({ ...prev, startDateValue: v }))}
                clearable
                radius={8}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label={tp('dueDate')}
                description={t('dueDateDesc')}
                placeholder={tp('dueDatePlaceholder')}
                value={formState.dueDateValue}
                onChange={(v) => setFormState((prev) => ({ ...prev, dueDateValue: v }))}
                minDate={formState.startDateValue || undefined}
                clearable
                radius={8}
              />
            </Grid.Col>
          </Grid>

          {habit && stats && (
            <>
              <Divider label={t('statistics')} labelPosition="center" />

              {stats.currentStreak < totalDays ? (
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
                        backgroundColor: effectiveCategory === 'good' ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                  <Text size="xs" c="dimmed" mt="xs">{t('daysUntilGoal', { count: totalDays - stats.currentStreak })}</Text>
                </Box>
              ) : (
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

              <Grid grow>
                <Grid.Col span={{ base: 4, sm: 4 }}>
                  <Box ta="center">
                    <Text size="xl" fw={700} c="blue">{stats.currentStreak}</Text>
                    <Text size="xs" c="dimmed">{t('currentStreak')}</Text>
                  </Box>
                </Grid.Col>
                <Grid.Col span={{ base: 4, sm: 4 }}>
                  <Box ta="center">
                    <Text size="xl" fw={700} c="blue">{stats.bestStreak}</Text>
                    <Text size="xs" c="dimmed">{t('bestStreak')}</Text>
                  </Box>
                </Grid.Col>
                <Grid.Col span={{ base: 4, sm: 4 }}>
                  <Box ta="center">
                    <Text size="xl" fw={700} c="grape">{stats.completionRate}%</Text>
                    <Text size="xs" c="dimmed">{t('completionRate')}</Text>
                  </Box>
                </Grid.Col>
              </Grid>

              <Divider label={t('completeHistory')} labelPosition="center" />

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

              <Text size="xs" c="dimmed" ta="center">{t('clickToToggle')}</Text>

              <Divider />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Button
                    variant="outline"
                    leftSection={habit.isActive === false ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                    onClick={() => onArchive(habit.id)}
                    fullWidth
                    radius={8}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {habit.isActive === false ? t('restoreHabit') : t('archiveHabit')}
                  </Button>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Button
                    variant="outline"
                    color="red"
                    leftSection={<Trash2 size={16} />}
                    onClick={() => onDelete(habit.id)}
                    fullWidth
                    radius={8}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {t('deleteHabit')}
                  </Button>
                </Grid.Col>
              </Grid>
            </>
          )}
        </Stack>
      </Box>

      <Box
        px="md"
        py="sm"
        style={{ borderTop: '1px solid #E5E7EB', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', flexShrink: 0 }}
      >
        {mode === 'create' ? (
          <Box>
            {!requiredFieldsFilled && (
              <Text size="xs" c="dimmed" mb={6}>{te('fillRequiredHint')}</Text>
            )}
            <Group justify="space-between" wrap="nowrap">
              <Button variant="outline" onClick={onClose} radius={8} style={{ whiteSpace: 'nowrap' }}>
                {tp('cancel')}
              </Button>
              <Button
                onClick={handleCreate}
                loading={createMutation.isPending}
                disabled={!requiredFieldsFilled}
                radius={8}
                style={{ whiteSpace: 'nowrap', backgroundColor: accentColor, border: 'none' }}
              >
                {tp('createHabit')}
              </Button>
            </Group>
          </Box>
        ) : (
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6} wrap="nowrap">
              {saveStatus === 'pending' && <Loader2 size={14} className="habit-drawer-spin" />}
              {saveStatus === 'saved' && <Check size={14} color="#16A34A" />}
              {saveStatus === 'error' && <AlertCircle size={14} color="#DC2626" />}
              <Text size="xs" c={saveStatus === 'error' ? 'red' : 'dimmed'} style={{ whiteSpace: 'nowrap' }}>
                {saveStatus === 'error' ? te('errorStatus') : te('savedStatus')}
              </Text>
            </Group>
            <Button onClick={onClose} radius={8} style={{ whiteSpace: 'nowrap', background: '#4686FE', border: 'none' }}>
              {te('finishEditing')}
            </Button>
          </Group>
        )}
      </Box>

      <style jsx global>{`
        .habit-drawer-spin { animation: habit-drawer-spin 1s linear infinite; }
        @keyframes habit-drawer-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Drawer>
  );
}
