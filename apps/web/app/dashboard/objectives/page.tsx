'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Target, Calendar, TrendingUp } from 'lucide-react';
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
  ThemeIcon,
  Progress,
  Loader,
  Center,
  Badge,
  Grid,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { modals } from '@mantine/modals';
import { useObjectives, useCreateObjective, useUpdateObjective, useDeleteObjective } from '@/hooks/useObjectives';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { CreateObjectiveDto, Objective } from '@/lib/api/services/objectives';

export default function ObjectivesPage() {
  const { data: objectives, isLoading } = useObjectives();
  const { data: lifeAreas } = useLifeAreas();
  const createMutation = useCreateObjective();
  const updateMutation = useUpdateObjective();
  const deleteMutation = useDeleteObjective();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [formData, setFormData] = useState<{
    lifeAreaId: string;
    title: string;
    description: string;
    startDate: Date | null;
    endDate: Date | null;
  }>({
    lifeAreaId: '',
    title: '',
    description: '',
    startDate: new Date(),
    endDate: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) return;

    try {
      const dto: CreateObjectiveDto = {
        lifeAreaId: formData.lifeAreaId,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
      };

      if (editingObjective) {
        await updateMutation.mutateAsync({ id: editingObjective.id, dto });
      } else {
        await createMutation.mutateAsync(dto);
      }

      setIsModalOpen(false);
      setEditingObjective(null);
      setFormData({
        lifeAreaId: '',
        title: '',
        description: '',
        startDate: new Date(),
        endDate: null,
      });
    } catch (error) {
      console.error('Error saving objective:', error);
    }
  };

  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
    setFormData({
      lifeAreaId: objective.lifeAreaId,
      title: objective.title,
      description: objective.description || '',
      startDate: new Date(objective.startDate),
      endDate: new Date(objective.endDate),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: 'Delete Objective',
      children: <Text size="sm">Are you sure you want to delete this objective? This action cannot be undone.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
        } catch (error) {
          console.error('Error deleting objective:', error);
        }
      },
    });
  };

  const handleNew = () => {
    setEditingObjective(null);
    setFormData({
      lifeAreaId: '',
      title: '',
      description: '',
      startDate: new Date(),
      endDate: null,
    });
    setIsModalOpen(true);
  };

  const getLifeAreaName = (lifeAreaId: string) => {
    return lifeAreas?.find((area) => area.id === lifeAreaId)?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
          <Title order={1} size="h2" mb="xs">Objectives</Title>
          <Text c="dimmed" size="sm">Manage your OKRs and objectives</Text>
        </div>
        <Button leftSection={<Plus size={20} />} onClick={handleNew}>
          New Objective
        </Button>
      </Group>

      {/* Objectives Grid */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        {objectives?.map((objective) => (
          <Card key={objective.id} shadow="sm" padding="lg" withBorder>
            <Group mb="md" wrap="nowrap" align="flex-start">
              <ThemeIcon size="xl" radius="md" color="blue" variant="light">
                <Target size={24} />
              </ThemeIcon>
              <div style={{ flex: 1 }}>
                <Group mb="xs" gap="xs">
                  <Text fw={600} size="lg" style={{ flex: 1 }}>{objective.title}</Text>
                  <Badge color={getStatusColor(objective.status)} size="sm">
                    {getStatusText(objective.status)}
                  </Badge>
                </Group>
                {objective.description && (
                  <Text size="sm" c="dimmed" mb="sm" lineClamp={2}>{objective.description}</Text>
                )}
                <Group gap="xs">
                  <TrendingUp size={14} />
                  <Text size="xs" c="dimmed">{getLifeAreaName(objective.lifeAreaId)}</Text>
                </Group>
              </div>
            </Group>

            {/* Progress Bar */}
            <Stack gap="xs" mb="md">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Progress</Text>
                <Text size="sm" fw={500}>{objective.progress}%</Text>
              </Group>
              <Progress value={objective.progress} color="blue" />
            </Stack>

            {/* Dates */}
            <Group gap="sm" mb="md" wrap="nowrap">
              <Group gap={4}>
                <Calendar size={14} />
                <Text size="xs" c="dimmed">{new Date(objective.startDate).toLocaleDateString()}</Text>
              </Group>
              <Text size="xs" c="dimmed">→</Text>
              <Group gap={4}>
                <Calendar size={14} />
                <Text size="xs" c="dimmed">{new Date(objective.endDate).toLocaleDateString()}</Text>
              </Group>
            </Group>

            {/* Actions */}
            <Group gap="xs" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
              <Button
                variant="light"
                leftSection={<Edit2 size={16} />}
                onClick={() => handleEdit(objective)}
                fullWidth
                size="sm"
              >
                Edit
              </Button>
              <Button
                variant="light"
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={() => handleDelete(objective.id)}
                fullWidth
                size="sm"
              >
                Delete
              </Button>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {objectives?.length === 0 && (
        <Card shadow="sm" padding="xl" withBorder>
          <Stack align="center" gap="md">
            <Text c="dimmed">No objectives yet</Text>
            <Button variant="light" onClick={handleNew}>
              Create your first objective
            </Button>
          </Stack>
        </Card>
      )}

      {/* Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingObjective(null);
        }}
        title={editingObjective ? 'Edit Objective' : 'New Objective'}
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
              placeholder="e.g., Achieve 10% body fat"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              withAsterisk
            />

            <Textarea
              label="Description"
              placeholder="Describe this objective..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <Grid>
              <Grid.Col span={6}>
                <DateInput
                  label="Start Date"
                  placeholder="Select start date"
                  value={formData.startDate}
                  onChange={(value) => setFormData({ ...formData, startDate: value })}
                  required
                  withAsterisk
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label="End Date"
                  placeholder="Select end date"
                  value={formData.endDate}
                  onChange={(value) => setFormData({ ...formData, endDate: value })}
                  required
                  withAsterisk
                />
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingObjective(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingObjective ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
