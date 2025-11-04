'use client';

import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import {
  Title,
  Text,
  Button,
  Stack,
  Modal,
  TextInput,
  Textarea,
  Select,
  Loader,
  Center,
  Box,
  Group,
  Divider,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { modals } from '@mantine/modals';
import { useHabits, useCreateHabit, useUpdateHabit, useDeleteHabit, useLogHabit } from '@/hooks/useHabits';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { CreateHabitDto, Habit } from '@/lib/api/services/habits';
import { HabitCard } from './components/HabitCard';
import { HabitModal } from './components/HabitModal';
import { habitsApi } from '@/lib/api/services/habits';

export default function HabitsPage() {
  const { data: habits, isLoading } = useHabits();
  const { data: lifeAreas } = useLifeAreas();
  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();
  const deleteMutation = useDeleteHabit();
  const logMutation = useLogHabit();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState<'good' | 'bad'>('good');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [habitLogs, setHabitLogs] = useState<Record<string, any[]>>({});

  const [formData, setFormData] = useState<CreateHabitDto>({
    title: '',
    description: '',
    category: 'good',
    type: 'boolean',
    frequency: 'daily',
    lifeAreaId: '',
    dueDate: '',
  });
  const [dueDateValue, setDueDateValue] = useState<Date | null>(null);

  // Separar hábitos por categoria
  const goodHabits = useMemo(() => {
    return habits?.filter((h) => h.category === 'good') || [];
  }, [habits]);

  const badHabits = useMemo(() => {
    return habits?.filter((h) => h.category === 'bad') || [];
  }, [habits]);

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

  // Carregar logs de todos os hábitos quando a lista de hábitos mudar
  React.useEffect(() => {
    if (habits) {
      habits.forEach((habit) => {
        loadHabitLogs(habit.id);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits]);

  const handleOpenCreateModal = (category: 'good' | 'bad') => {
    setCreatingCategory(category);
    // Default due date: 21 days from today
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 21);
    setDueDateValue(defaultDueDate);

    setFormData({
      title: '',
      description: '',
      category,
      type: 'boolean',
      frequency: 'daily',
      lifeAreaId: '',
      dueDate: defaultDueDate.toISOString().split('T')[0],
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const handleEdit = async (habit: Habit) => {
    setEditingHabit(habit);
    await loadHabitLogs(habit.id);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (habitId: string, updates: { title: string; description?: string }) => {
    try {
      await updateMutation.mutateAsync({
        id: habitId,
        dto: updates,
      });
      setEditModalOpen(false);
      setEditingHabit(null);
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const handleDelete = (habitId: string) => {
    modals.openConfirmModal({
      title: 'Delete Habit',
      children: (
        <Text size="sm">
          Are you sure you want to delete this habit? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(habitId);
          setEditModalOpen(false);
          setEditingHabit(null);
        } catch (error) {
          console.error('Error deleting habit:', error);
        }
      },
    });
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

  if (isLoading) {
    return (
      <Center h={300}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      {/* Header */}
      <Box>
        <Title order={1} size="h2" mb="xs">
          Habit Tracker
        </Title>
        <Text c="dimmed" size="sm">
          Track your daily habits and build consistency
        </Text>
      </Box>

      {/* Section: Good Habits */}
      <Box>
        <Group justify="space-between" mb="md">
          <Title order={2} size="h3" c="green">
            Good Habits to Start
          </Title>
          <Button
            leftSection={<Plus size={20} />}
            onClick={() => handleOpenCreateModal('good')}
            color="green"
          >
            Add Good Habit
          </Button>
        </Group>

        {goodHabits.length === 0 ? (
          <Alert variant="light" color="gray" title="No good habits yet">
            Start by adding positive habits you want to implement in your routine!
          </Alert>
        ) : (
          <Stack gap="md">
            {goodHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                logs={habitLogs[habit.id] || []}
                onEdit={handleEdit}
                onDayClick={handleDayClick}
              />
            ))}
          </Stack>
        )}
      </Box>

      <Divider size="md" />

      {/* Section: Bad Habits */}
      <Box>
        <Group justify="space-between" mb="md">
          <Title order={2} size="h3" c="red">
            Habits to Eliminate
          </Title>
          <Button
            leftSection={<Plus size={20} />}
            onClick={() => handleOpenCreateModal('bad')}
            color="red"
          >
            Add Bad Habit
          </Button>
        </Group>

        {badHabits.length === 0 ? (
          <Alert variant="light" color="gray" title="No bad habits yet">
            Add negative habits you want to eliminate from your life!
          </Alert>
        ) : (
          <Stack gap="md">
            {badHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                logs={habitLogs[habit.id] || []}
                onEdit={handleEdit}
                onDayClick={handleDayClick}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Create Modal */}
      <Modal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={
          <Text fw={600} size="lg">
            {creatingCategory === 'good' ? 'New Good Habit' : 'New Bad Habit'}
          </Text>
        }
        size="md"
      >
        <form onSubmit={handleCreateSubmit}>
          <Stack gap="md">
            <Alert variant="light" color="blue" title="21-Day Challenge">
              Research shows it takes <strong>21 days</strong> of consistent practice to form a new habit.
              Stay committed and track your progress daily!
            </Alert>
            <Select
              label="Life Area"
              placeholder="Select an area"
              value={formData.lifeAreaId}
              onChange={(value) => setFormData({ ...formData, lifeAreaId: value || '' })}
              data={lifeAreas?.map((area) => ({ value: area.id, label: area.name })) || []}
              required
              withAsterisk
            />

            <TextInput
              label="Title"
              placeholder="E.g., Morning meditation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              withAsterisk
            />

            <Textarea
              label="Description"
              placeholder="Describe this habit..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <DateInput
              label="Due Date"
              description="Set your target completion date (default: 21 days from today)"
              placeholder="Select date"
              value={dueDateValue}
              onChange={(date) => {
                setDueDateValue(date);
                setFormData({
                  ...formData,
                  dueDate: date ? date.toISOString().split('T')[0] : '',
                });
              }}
              minDate={new Date()}
              withAsterisk
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending}
                color={creatingCategory === 'good' ? 'green' : 'red'}
              >
                Create Habit
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editingHabit && (
        <HabitModal
          opened={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingHabit(null);
          }}
          habit={editingHabit}
          logs={habitLogs[editingHabit.id] || []}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
          onDayClick={handleDayClick}
          isSaving={updateMutation.isPending}
        />
      )}
    </Stack>
  );
}
