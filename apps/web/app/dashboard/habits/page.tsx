'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@mantine/hooks';
import {
  Title,
  Text,
  Stack,
  Loader,
  Center,
  Box,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useHabits, useAllHabits, useDeleteHabit, useLogHabit, useArchivedHabits, useHabitCounts, useToggleArchive } from '@/hooks/useHabits';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { Habit } from '@/lib/api/services/habits';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Surface } from '@/components/ui/Surface';
import { HabitsFilter, HabitsFilterType } from './components/HabitsFilter';
import { HabitColumn } from './components/HabitColumn';
import { EditDrawer } from './components/EditDrawer';
import { habitsApi } from '@/lib/api/services/habits';

export default function HabitsPage() {
  const t = useTranslations('habits.page');
  const [currentFilter, setCurrentFilter] = useState<HabitsFilterType>('active');
  const colors = useThemeColors();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const { data: activeHabits, isLoading: activeLoading } = useHabits(undefined, false); // Only active habits
  const { data: allHabits, isLoading: allLoading } = useAllHabits(); // All habits (active + archived)
  const { data: archivedHabits, isLoading: archivedLoading } = useArchivedHabits();
  const { data: habitCounts } = useHabitCounts();

  // Choose the right data source based on current filter
  const habits = currentFilter === 'all' ? allHabits : activeHabits;
  const isLoading = currentFilter === 'all' ? allLoading : activeLoading;
  const { data: lifeAreas } = useLifeAreas();
  const deleteMutation = useDeleteHabit();
  const logMutation = useLogHabit();
  const archiveMutation = useToggleArchive();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState<'good' | 'bad'>('good');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitLogs, setHabitLogs] = useState<Record<string, any[]>>({});

  const isPageLoading = isLoading || (currentFilter === 'archived' && archivedLoading);

  // Separar hábitos por categoria (apenas para visualização ativa)
  const goodHabits = useMemo(() => {
    return habits?.filter((h) => h.category === 'good') || [];
  }, [habits]);

  const badHabits = useMemo(() => {
    return habits?.filter((h) => h.category === 'bad') || [];
  }, [habits]);

  // Separar hábitos arquivados por categoria (para visualização arquivada)
  const goodArchivedHabits = useMemo(() => {
    return archivedHabits?.filter((h) => h.category === 'good') || [];
  }, [archivedHabits]);

  const badArchivedHabits = useMemo(() => {
    return archivedHabits?.filter((h) => h.category === 'bad') || [];
  }, [archivedHabits]);

  // Carregar logs de um hábito
  const loadHabitLogs = async (habitId: string) => {
    if (!habitLogs[habitId]) {
      try {
        const logs = await habitsApi.getHabitLogs(habitId);
        setHabitLogs((prev) => ({ ...prev, [habitId]: logs }));
      } catch (error) {
        console.error('Error loading habit logs:', error);
      }
    }
  };

  // Logs are loaded on-demand via loadHabitLogs when user interacts with a habit

  const handleOpenCreateDrawer = (category: 'good' | 'bad') => {
    setCreatingCategory(category);
    setEditingHabit(null);
    setDrawerOpen(true);
  };

  const handleHabitCreated = async (habit: Habit) => {
    // Keeps the drawer open, now in edit mode, for the habit just created.
    setEditingHabit(habit);
    await loadHabitLogs(habit.id);
  };

  const handleEdit = async (habit: Habit) => {
    setEditingHabit(habit);
    await loadHabitLogs(habit.id);
    setDrawerOpen(true);
  };

  const handleDelete = (habitId: string) => {
    modals.openConfirmModal({
      title: t('deleteHabitTitle'),
      children: (
        <Text size="sm">
          {t('deleteHabitBody')}
        </Text>
      ),
      labels: { confirm: t('delete'), cancel: t('cancel') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(habitId);
          setDrawerOpen(false);
          setEditingHabit(null);
        } catch (error) {
          console.error('Error deleting habit:', error);
        }
      },
    });
  };

  const handleArchive = (habitId: string) => {
    archiveMutation.mutate(habitId);
    setDrawerOpen(false);
    setEditingHabit(null);
  };

  const handleUnarchive = (habit: Habit) => {
    archiveMutation.mutate(habit.id);
  };

  const handleDayClick = async (habitId: string, date: string) => {
    const today = new Date().toISOString().split('T')[0];

    // Só permite marcar até hoje (não permite marcar dias futuros)
    if (date > today) {
      return;
    }

    const logs = habitLogs[habitId] || [];
    const existingLog = logs.find((log) => log.date === date);

    try {
      if (existingLog) {
        // Se já existe, alternar o estado de completed
        const newCompletedState = !existingLog.completed;

        await logMutation.mutateAsync({
          habitId,
          date,
          completed: newCompletedState,
        });

        // Atualizar logs localmente
        setHabitLogs((prev) => ({
          ...prev,
          [habitId]: prev[habitId].map((log) =>
            log.date === date ? { ...log, completed: newCompletedState } : log
          ),
        }));
      } else {
        // Se não existe, criar novo log como completado
        const newLog = await logMutation.mutateAsync({
          habitId,
          date,
          completed: true,
        });

        // Adicionar aos logs localmente
        setHabitLogs((prev) => ({
          ...prev,
          [habitId]: [...(prev[habitId] || []), newLog],
        }));
      }

      // Recarregar logs do hábito
      await loadHabitLogs(habitId);
    } catch (error) {
      console.error('Error toggling habit log:', error);
    }
  };

  if (isPageLoading) {
    return (
      <Center h={300}>
        <Loader size="lg" color={colors.primary} />
      </Center>
    );
  }

  return (
    <React.Fragment>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Surface p={{ base: 'md', sm: 'xl' }} style={{ paddingRight: drawerOpen && isDesktop ? 480 : undefined, transition: 'padding-right 0.2s ease' }}>
      <Stack
        gap="xl"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Header */}
        <Box>
          <Title
            order={1}
            mb="xs"
            style={{
              fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: 'clamp(22px, 5vw, 32px)',
              fontWeight: 700,
              color: colors.text.primary,
              letterSpacing: '-0.02em',
            }}
          >
            {t('title')}
          </Title>
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              color: '#666666',
              lineHeight: '24px',
            }}
          >
            {t('subtitle')}
          </Text>
        </Box>

      {/* Filter Bar */}
      <HabitsFilter
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        habitCounts={habitCounts}
      />

      {/* Kanban Layout for both Active and Archived */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))',
          gap: '24px',
          width: '100%',
        }}
      >
        {currentFilter === 'archived' ? (
          <>
            {/* Archived Good Habits Column */}
            <HabitColumn
              title={t('archivedGoodTitle')}
              habits={goodArchivedHabits}
              habitLogs={habitLogs}
              onAddHabit={() => {}}
              onEdit={handleEdit}
              onDayClick={handleDayClick}
              onUnarchive={handleUnarchive}
              isArchived={true}
              addButtonText=""
              emptyStateTitle={t('archivedGoodEmpty')}
              emptyStateMessage={t('archivedGoodEmptyMsg')}
              openHabitId={drawerOpen ? editingHabit?.id : undefined}
            />

            {/* Archived Bad Habits Column */}
            <HabitColumn
              title={t('archivedBadTitle')}
              habits={badArchivedHabits}
              habitLogs={habitLogs}
              onAddHabit={() => {}}
              onEdit={handleEdit}
              onDayClick={handleDayClick}
              onUnarchive={handleUnarchive}
              isArchived={true}
              addButtonText=""
              emptyStateTitle={t('archivedBadEmpty')}
              emptyStateMessage={t('archivedBadEmptyMsg')}
              openHabitId={drawerOpen ? editingHabit?.id : undefined}
            />
          </>
        ) : (
          <>
            {/* Good Habits Column */}
            <HabitColumn
              title={t('goodTitle')}
              habits={goodHabits}
              habitLogs={habitLogs}
              onAddHabit={() => handleOpenCreateDrawer('good')}
              onEdit={handleEdit}
              onDayClick={handleDayClick}
              isArchived={false}
              addButtonText={t('addGood')}
              emptyStateTitle={t('goodEmpty')}
              emptyStateMessage={t('goodEmptyMsg')}
              openHabitId={drawerOpen ? editingHabit?.id : undefined}
            />

            {/* Bad Habits Column */}
            <HabitColumn
              title={t('badTitle')}
              habits={badHabits}
              habitLogs={habitLogs}
              onAddHabit={() => handleOpenCreateDrawer('bad')}
              onEdit={handleEdit}
              onDayClick={handleDayClick}
              isArchived={false}
              addButtonText={t('addBad')}
              emptyStateTitle={t('badEmpty')}
              emptyStateMessage={t('badEmptyMsg')}
              openHabitId={drawerOpen ? editingHabit?.id : undefined}
            />
          </>
        )}
      </Box>

      <EditDrawer
        opened={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingHabit(null); }}
        habit={editingHabit}
        category={creatingCategory}
        logs={editingHabit ? habitLogs[editingHabit.id] || [] : []}
        lifeAreas={lifeAreas || []}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onDayClick={handleDayClick}
        onCreated={handleHabitCreated}
      />
      </Stack>
      </Surface>
    </React.Fragment>
  );
}
