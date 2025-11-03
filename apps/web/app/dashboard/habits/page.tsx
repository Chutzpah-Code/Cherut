'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Circle, TrendingUp, Calendar } from 'lucide-react';
import {
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  SimpleGrid,
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  ThemeIcon,
  Badge,
  Loader,
  Center,
  Checkbox,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useHabits, useCreateHabit, useUpdateHabit, useDeleteHabit, useLogHabit } from '@/hooks/useHabits';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { CreateHabitDto, Habit, LogHabitDto } from '@/lib/api/services/habits';

export default function HabitsPage() {
  const { data: habits, isLoading } = useHabits();
  const { data: lifeAreas } = useLifeAreas();
  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();
  const deleteMutation = useDeleteHabit();
  const logMutation = useLogHabit();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState<CreateHabitDto>({
    title: '',
    description: '',
    type: 'boolean',
    frequency: 'daily',
    lifeAreaId: '',
  });

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [loggingHabit, setLoggingHabit] = useState<Habit | null>(null);
  const [logFormData, setLogFormData] = useState<Partial<LogHabitDto>>({
    date: new Date().toISOString().split('T')[0],
    completed: false,
    value: 0,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingHabit) {
        await updateMutation.mutateAsync({ id: editingHabit.id, dto: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setIsModalOpen(false);
      setEditingHabit(null);
      setFormData({
        title: '',
        description: '',
        type: 'boolean',
        frequency: 'daily',
        lifeAreaId: '',
      });
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({
      title: habit.title,
      description: habit.description || '',
      type: habit.type,
      frequency: habit.frequency,
      targetValue: habit.targetValue,
      unit: habit.unit,
      lifeAreaId: habit.lifeAreaId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: 'Delete Habit',
      children: <Text size="sm">Are you sure you want to delete this habit? This action cannot be undone.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
        } catch (error) {
          console.error('Error deleting habit:', error);
        }
      },
    });
  };

  const handleNew = () => {
    setEditingHabit(null);
    setFormData({
      title: '',
      description: '',
      type: 'boolean',
      frequency: 'daily',
      lifeAreaId: '',
    });
    setIsModalOpen(true);
  };

  const handleLogClick = (habit: Habit) => {
    setLoggingHabit(habit);
    setLogFormData({
      date: new Date().toISOString().split('T')[0],
      completed: habit.type === 'boolean' ? false : undefined,
      value: habit.type !== 'boolean' ? 0 : undefined,
      notes: '',
    });
    setLogModalOpen(true);
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loggingHabit) return;

    try {
      const logDto: LogHabitDto = {
        habitId: loggingHabit.id,
        date: logFormData.date!,
        completed: logFormData.completed,
        value: logFormData.value,
        notes: logFormData.notes,
      };

      await logMutation.mutateAsync(logDto);
      setLogModalOpen(false);
      setLoggingHabit(null);
    } catch (error) {
      console.error('Error logging habit:', error);
    }
  };

  const quickLogBoolean = async (habit: Habit) => {
    try {
      const logDto: LogHabitDto = {
        habitId: habit.id,
        date: new Date().toISOString().split('T')[0],
        completed: true,
      };
      await logMutation.mutateAsync(logDto);
    } catch (error) {
      console.error('Error logging habit:', error);
    }
  };

  const getLifeAreaName = (lifeAreaId: string | undefined) => {
    if (!lifeAreaId) return 'Unknown';
    return lifeAreas?.find((area) => area.id === lifeAreaId)?.name || 'Unknown';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'boolean':
        return <CheckCircle size={20} />;
      case 'counter':
        return <Text size="lg" fw={700}>123</Text>;
      case 'duration':
        return <Calendar size={20} />;
      default:
        return <Circle size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'boolean':
        return 'Yes/No';
      case 'counter':
        return 'Counter';
      case 'duration':
        return 'Duration';
      default:
        return type;
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
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1} size="h2" mb="xs">Habits</Title>
          <Text c="dimmed" size="sm">Track your daily habits and build consistency</Text>
        </div>
        <Button leftSection={<Plus size={20} />} onClick={handleNew}>
          New Habit
        </Button>
      </Group>

      {/* Habits Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {habits?.map((habit) => (
          <Card key={habit.id} shadow="sm" padding="lg" withBorder>
            <Group mb="md" wrap="nowrap" align="flex-start">
              <ThemeIcon size="xl" radius="md" color="green" variant="light">
                {getTypeIcon(habit.type)}
              </ThemeIcon>
              <Stack gap="xs" style={{ flex: 1 }}>
                <Text fw={600} size="lg">{habit.title}</Text>
                {habit.description && (
                  <Text size="sm" c="dimmed" lineClamp={2}>{habit.description}</Text>
                )}
                <Group gap="xs">
                  <Badge size="sm" variant="light" color="gray">
                    {getTypeLabel(habit.type)}
                  </Badge>
                  <Badge size="sm" variant="light" color="gray" tt="capitalize">
                    {habit.frequency}
                  </Badge>
                  {habit.targetValue && (
                    <Badge size="sm" variant="light" color="blue">
                      Target: {habit.targetValue} {habit.unit || ''}
                    </Badge>
                  )}
                </Group>
              </Stack>
            </Group>

            <Group gap="xs" mb="md">
              <TrendingUp size={14} />
              <Text size="xs" c="dimmed">{getLifeAreaName(habit.lifeAreaId)}</Text>
            </Group>

            {/* Actions */}
            <Stack gap="xs">
              {habit.type === 'boolean' ? (
                <Button
                  fullWidth
                  color="green"
                  leftSection={<CheckCircle size={16} />}
                  onClick={() => quickLogBoolean(habit)}
                >
                  Mark as Done Today
                </Button>
              ) : (
                <Button
                  fullWidth
                  color="green"
                  leftSection={<Plus size={16} />}
                  onClick={() => handleLogClick(habit)}
                >
                  Log Entry
                </Button>
              )}

              <Group gap="xs" mt="xs" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
                <Button
                  variant="light"
                  leftSection={<Edit2 size={16} />}
                  onClick={() => handleEdit(habit)}
                  fullWidth
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  variant="light"
                  color="red"
                  leftSection={<Trash2 size={16} />}
                  onClick={() => handleDelete(habit.id)}
                  fullWidth
                  size="sm"
                >
                  Delete
                </Button>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {habits?.length === 0 && (
        <Card shadow="sm" padding="xl" withBorder>
          <Stack align="center" gap="md">
            <Text c="dimmed">No habits yet</Text>
            <Button variant="light" onClick={handleNew}>
              Create your first habit
            </Button>
          </Stack>
        </Card>
      )}

      {/* Habit Create/Edit Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        title={editingHabit ? 'Edit Habit' : 'New Habit'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Select
              label="Life Area"
              placeholder="Select a life area"
              value={formData.lifeAreaId}
              onChange={(value) => setFormData({ ...formData, lifeAreaId: value || '' })}
              data={lifeAreas?.map((area) => ({ value: area.id, label: area.name })) || []}
              required
              withAsterisk
            />

            <TextInput
              label="Title"
              placeholder="e.g., Morning meditation"
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

            <Select
              label="Type"
              value={formData.type}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  type: value as 'boolean' | 'counter' | 'duration',
                })
              }
              data={[
                { value: 'boolean', label: 'Yes/No (Boolean)' },
                { value: 'counter', label: 'Counter (Numbers)' },
                { value: 'duration', label: 'Duration (Time)' },
              ]}
              required
              withAsterisk
            />

            <Select
              label="Frequency"
              value={formData.frequency}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  frequency: value as 'daily' | 'weekly' | 'monthly',
                })
              }
              data={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
              required
              withAsterisk
            />

            {formData.type !== 'boolean' && (
              <>
                <NumberInput
                  label="Target Value"
                  placeholder="e.g., 10000 for steps"
                  value={formData.targetValue}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      targetValue: typeof value === 'number' ? value : undefined,
                    })
                  }
                  min={0}
                />

                <TextInput
                  label="Unit"
                  placeholder="e.g., steps, minutes, pages"
                  value={formData.unit || ''}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingHabit(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingHabit ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Habit Log Modal */}
      <Modal
        opened={logModalOpen && !!loggingHabit}
        onClose={() => {
          setLogModalOpen(false);
          setLoggingHabit(null);
        }}
        title={`Log: ${loggingHabit?.title}`}
        size="md"
      >
        <form onSubmit={handleLogSubmit}>
          <Stack gap="md">
            <TextInput
              label="Date"
              type="date"
              value={logFormData.date}
              onChange={(e) => setLogFormData({ ...logFormData, date: e.target.value })}
              required
              withAsterisk
            />

            {loggingHabit?.type === 'boolean' ? (
              <Checkbox
                label="Completed"
                checked={logFormData.completed || false}
                onChange={(e) =>
                  setLogFormData({ ...logFormData, completed: e.currentTarget.checked })
                }
              />
            ) : (
              <NumberInput
                label={`Value ${loggingHabit?.unit ? `(${loggingHabit.unit})` : ''}`}
                value={logFormData.value || 0}
                onChange={(value) =>
                  setLogFormData({ ...logFormData, value: typeof value === 'number' ? value : 0 })
                }
                min={0}
                required
                withAsterisk
              />
            )}

            <Textarea
              label="Notes"
              placeholder="Add notes about this entry..."
              value={logFormData.notes}
              onChange={(e) => setLogFormData({ ...logFormData, notes: e.target.value })}
              rows={3}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => {
                  setLogModalOpen(false);
                  setLoggingHabit(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="green"
                loading={logMutation.isPending}
              >
                Log Entry
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
